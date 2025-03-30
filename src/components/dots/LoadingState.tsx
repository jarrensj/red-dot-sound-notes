
const LoadingState = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="ml-2 text-indigo-600">Loading dots...</span>
    </div>
  );
};

export default LoadingState;
