const logger = global.$logger || window.$logger

export const getLogger = logger.getLogger.bind(logger)
export default logger
