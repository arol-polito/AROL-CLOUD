import Machinery from "./Machinery";
import MachineryLog from "./MachineryLog";

export default interface MachineryWithLogs{
    machinery: Machinery,
    logs: Array<MachineryLog>
}