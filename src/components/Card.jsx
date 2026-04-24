export default function Card({ title, value }) {
  return (
    <div className="card p-5 hover:shadow-md transition duration-200">
      
      <p className="text-sm text-slate-400">{title}</p>

      <h2 className="text-3xl font-semibold text-slate-800 mt-2">
        {value}
      </h2>

    </div>
  );
}