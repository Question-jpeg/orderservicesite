import { Component } from 'react';

export default class ScrollToTop extends Component {
    componentDidUpdate(prevProps) {
      if (
        this.props.location.pathname !== prevProps.location.pathname
      ) {
        window.scrollTo({top: 0});
      }
    }
  
    render() {
      return null;
    }
  }