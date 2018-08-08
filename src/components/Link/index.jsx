import React, { Component } from 'react'
import PropTypes from 'prop-types'
import history from 'src/history'
import s from './Link.scss'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import { Icon } from 'antd'

class Link extends Component {
  static propTypes = {
    to: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func
  };

  static defaultProps = {
    onClick: null
  };

  handleClick = evt => {
    const { onClick } = this.props
    if (onClick) {
      this.props.onClick(event)
    }

    if (event.defaultPrevented === true) {
      return
    }

    evt.preventDefault()
    history.push(this.props.to)
  };

  render() {
    const { children, ...props } = this.props
    return (
      <a className={s.link} {...props} onClick={this.handleClick}>
        <Icon type='link' />{children}
        
        {/* {children} */}
      </a>
    )
  }
}

export default withStyles(s)(Link)
