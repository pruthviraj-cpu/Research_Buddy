const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
    <span className="relative inline-block w-12 h-12 rounded-full border-[3px] border-gray-500 box-border animate-spin">
      <span className="absolute left-1/2 top-1/2 w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-transparent border-b-[#3b82f6] box-border" />
    </span>
    </div>
  );
}

export default Loader;