import { react2angular } from 'react2angular';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Tooltip from 'antd/lib/tooltip';
import Drawer from 'antd/lib/drawer';
import { BigMessage } from '@/components/BigMessage';
import DynamicComponent from '@/components/DynamicComponent';

import './HelpTrigger.less';

const DOMAIN = 'https://redash.io';
const HELP_PATH = '/help';
const IFRAME_TIMEOUT = 20000;
const TYPES = {
  HOME: [
    '',
    'Help',
  ],
  VALUE_SOURCE_OPTIONS: [
    '/user-guide/querying/query-parameters#Value-Source-Options',
    'Guide: Value Source Options',
  ],
  SHARE_DASHBOARD: [
    '/user-guide/dashboards/sharing-dashboards',
    'Guide: Sharing and Embedding Dashboards',
  ],
};

export class HelpTrigger extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(Object.keys(TYPES)).isRequired,
    className: PropTypes.string,
  }

  static defaultProps = {
    className: null,
  };

  iframeRef = null

  iframeLoadingTimeout = null

  constructor(props) {
    super(props);
    this.iframeRef = React.createRef();
  }

  state = {
    visible: false,
    loading: false,
    error: false,
  };

  componentWillUnmount() {
    clearTimeout(this.iframeLoadingTimeout);
  }

  loadIframe = (url) => {
    clearTimeout(this.iframeLoadingTimeout);
    this.setState({ loading: true, error: false });

    this.iframeRef.current.src = url;
    this.iframeLoadingTimeout = setTimeout(() => {
      this.setState({ error: url, loading: false });
    }, IFRAME_TIMEOUT); // safety
  }

  onIframeLoaded = () => {
    this.setState({ loading: false });
    clearTimeout(this.iframeLoadingTimeout);
  }

  openDrawer = () => {
    this.setState({ visible: true });
    const [pagePath] = TYPES[this.props.type];
    const url = DOMAIN + HELP_PATH + pagePath;

    // wait for drawer animation to complete so there's no animation jank
    setTimeout(() => this.loadIframe(url), 300);
  }

  closeDrawer = () => {
    this.setState({ visible: false });
  }

  render() {
    const [, tooltip] = TYPES[this.props.type];
    const className = cx('help-trigger', this.props.className);

    return (
      <React.Fragment>
        <Tooltip title={tooltip}>
          <a href="javascript: void(0)" onClick={this.openDrawer} className={className}>
            <i className="fa fa-question-circle" />
          </a>
        </Tooltip>
        <Drawer
          placement="right"
          onClose={this.closeDrawer}
          visible={this.state.visible}
          className="help-drawer"
          destroyOnClose
          width={400}
        >
          <div className="drawer-wrapper">
            {/* iframe */}
            {!this.state.error && (
              <iframe
                ref={this.iframeRef}
                title="Redash Help"
                src="about:blank"
                className={cx({ ready: !this.state.loading })}
                onLoad={this.onIframeLoaded}
              />
            )}

            {/* loading indicator */}
            {this.state.loading && (
              <BigMessage icon="fa-spinner fa-2x fa-pulse" message="Loading..." className="help-message" />
            )}

            {/* error message */}
            {this.state.error && (
              <BigMessage icon="fa-exclamation-circle" className="help-message">
                Something went wrong.<br />
                {/* eslint-disable-next-line react/jsx-no-target-blank */}
                <a href={this.state.error} target="_blank" rel="noopener">Click here</a>{' '}
                to open the page in a new window.
              </BigMessage>
            )}
          </div>

          {/* extra content */}
          <DynamicComponent
            name="HelpDrawerExtraContent"
            onLeave={this.closeDrawer}
            openPageUrl={this.loadIframe}
          />
        </Drawer>
      </React.Fragment>
    );
  }
}

export default function init(ngModule) {
  ngModule.component('helpTrigger', react2angular(HelpTrigger));
}

init.init = true;
