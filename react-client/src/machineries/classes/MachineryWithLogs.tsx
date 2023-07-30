import type Machinery from './Machinery'
import type MachineryLog from './MachineryLog'

export default interface MachineryWithLogs {
  machinery: Machinery
  logs: MachineryLog[]
}
