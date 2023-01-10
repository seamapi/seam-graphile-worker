import { TaskOptions } from "types"

export default (args: {
  task_name: string
  parameters: any
  options: TaskOptions
}): undefined | string => {
  const { task_name, parameters, options } = args

  if (options.job_key) {
    return options.job_key
  }

  let job_key

  if (options.no_duplicates === true) {
    options.no_duplicates = Object.keys(parameters)
  }

  if (options.no_duplicates) {
    options.no_duplicates.sort()

    job_key = [
      task_name,
      ...options.no_duplicates.map((key) =>
        serializeParameter(key, parameters[key])
      ),
    ].join("_")
  }

  return job_key
}

const serializeParameter = (key: string, parameter: any) => {
  if (typeof parameter === "string") return parameter
  if (typeof parameter === "boolean") return `${key}=${parameter}`
  if (Number.isInteger(parameter)) return parameter.toString()

  throw new TypeError(
    `Only strings, integers, or booleans can be used as no_duplicates parameters, column "${key}" was ${typeof parameter}`
  )
}
