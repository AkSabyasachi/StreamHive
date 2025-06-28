const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req,res,next))
      .catch((err) => next(err)) //Auto-forwarding the error to the next middleware
  }
}

export {asyncHandler}









// --------------This is a utility function to handle async errors in Express.js routes.
//this function uses try/catch to handle errors in asynchronous route handlers.---------------//

// const asyncHandler = (fn) => async (req,res,next) => {
//   try
//   {
//     await fn(req, res, next)
//   }
//   catch (error)
//   {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.messaage,
//     })
//   }
// }