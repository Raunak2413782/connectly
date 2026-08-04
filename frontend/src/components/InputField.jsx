function InputField(props) {
  return (
    <div className="mb-5">
      <label className="block text-gray-300 font-medium mb-2">
        {props.label}
      </label>

      <input
        type={props.type}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
        className="
          w-full
          px-4
          py-3
          rounded-lg
          bg-slate-700
          text-white
          placeholder-gray-400
          border
          border-slate-600
          focus:outline-none
          focus:ring-2
          focus:ring-green-500
          focus:border-green-500
          transition
        "
      />
    </div>
  );
}

export default InputField;