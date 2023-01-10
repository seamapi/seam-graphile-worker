import { CrontabItem } from "types"

export const generateGraphileWorkerCrontab = (items: CrontabItem<any>[]) => {
  return items
    .map(
      (item, i) =>
        `${
          item.frequency
        } add_job_task ?id=crontab_item_${i}&max=1 ${JSON.stringify({
          task: item.task,
          payload: item.payload,
          options: item.options,
        })}`
    )
    .join("\n")
}

export default generateGraphileWorkerCrontab
