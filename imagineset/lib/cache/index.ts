import NodeCache from "node-cache"
import singleton from '../singleton'

export default singleton('cache', () => {
  return new NodeCache();
})