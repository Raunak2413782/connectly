function InputField(props) {
  return (
    <div>
      <p>{props.label}</p>
      <input
        type={props.type}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
}

export default InputField;