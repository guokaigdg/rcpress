import React from 'react';
import { Alert } from 'antd';

const MdAlert = props => {
  return (
    <Alert
      className="md-alert"
      showIcon
      {...props}
      description={props.children}
    />
  );
};

export default SiteContext => ({
  MdAlert: MdAlert,
  SiteCustomer: SiteContext.Consumer
});