function AuthHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-green-400">
        {title}
      </h1>

      <p className="text-gray-400 mt-2">
        {subtitle}
      </p>
    </div>
  );
}

export default AuthHeader;