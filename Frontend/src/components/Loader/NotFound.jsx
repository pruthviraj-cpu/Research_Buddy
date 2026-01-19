const ErrorState = ({
  title = "Something went wrong",
  message = "We couldn’t load the data. Please try again.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-5xl">⚠️</div>

      <h2 className="text-xl font-semibold text-gray-800">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-gray-500">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 rounded-md bg-red-500 px-6 py-2 text-white hover:bg-red-600 transition"
        >
          Retry
        </button>
      )}
    </div>
  );
}
export default ErrorState;