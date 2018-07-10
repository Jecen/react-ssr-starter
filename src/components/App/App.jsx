import react, {Component} from 'react'
import './App.scss'

export default class app extends Component {
  static defaultProps={
  }

  static propTypes = {
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {}

  render() {
    return (
      <div className="page">
        示范页面
      </div>
    )
  }
}
