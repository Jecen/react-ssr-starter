import React, { Component } from 'react'
import { Button, message, Form, Icon, Input, Checkbox } from 'antd'
import PropTypes from 'prop-types'
import s from './login.scss'
import withStyles from 'isomorphic-style-loader/lib/withStyles'
const FormItem = Form.Item

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      isRemember: false,
      isLoading: false
    }
  }

  static contextTypes = {
    nav: PropTypes.object,
    store: PropTypes.any,
  };

  static defaultProps = {};

  static propTypes = {form: PropTypes.any};

  login = async ({username , password , remember}) => {
    const {isLoading} = this.state
    if (isLoading) return
    this.setState({isLoading: true})
    const { nav, store } = this.context
    const { state } = store
    try {
      // const rst = await store.login('lfwdlx0@xhqsg', '11111111', false)
      const rst = await store.login(username , password , remember)
      message.success(`欢迎回来：${state.user.name}`, 1)
      console.log('login page get rst!!', rst)
      nav.push('/home')
    } catch (error) {
      console.log('login page get error!!', error)
    } finally {
      this.setState({isLoading: false})
    }
  };

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // const {username , password , remember} = values
        this.login(values)
      }
    })
  }
  
  componentDidMount() {
    const { store } = this.context
    const { state: { remember } } = store
    if (remember) {
      const { username, password } = remember
      this.props.form.setFieldsValue({
        username,
        password,
        remember: !!remember
      })
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <div className={s['login-page']}>
        <Form onSubmit={this.handleSubmit} className={s['login-form']}>
          <FormItem>
            {getFieldDecorator('username', {rules: [{ required: true, message: 'Please input your username!' }],})(
              <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {rules: [{ required: true, message: 'Please input your Password!'}],})(
              <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: false,
            })(
              <Checkbox>Remember me</Checkbox>
            )}
            <a className={s['login-form-forgot']} href="">Forgot password</a>
            <Button type="primary" htmlType="submit" className={s['login-form-button']} >
              Log in
            </Button>
            Or <a href="">register now!</a>
          </FormItem>
        </Form>
      </div>
    )
  }
}

export default Form.create()(withStyles(s)(Login))
