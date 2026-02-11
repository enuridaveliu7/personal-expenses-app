import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f6f8f6] via-[#eef3ee] to-[#f1f5f1] text-gray-800 overflow-hidden">
    <div className="flex justify-between items-center px-12 py-6">

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#6f8f72] flex items-center justify-center text-white font-bold">
            €
          </div>

          <h1 className="text-xl font-semibold tracking-wide">
            Expenses
          </h1>
        </div>

        <div className="flex gap-4">
          <Link
            to="/login"
            className="text-gray-500 hover:text-gray-800 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-[#6f8f72] text-white px-5 py-2 rounded-xl font-semibold hover:bg-[#5e7a60] transition"
          >
            Get Started
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center text-center mt-24 px-6">

        <h2 className="text-6xl font-bold leading-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-[#6f8f72]">
          Take control of your finances
        </h2>

        <p className="text-gray-500 mt-6 text-lg max-w-xl">
          Track expenses, monitor income and build better financial habits with a modern dashboard.
        </p>

        <div className="flex gap-4 mt-10">
          <Link
            to="/register"
            className="px-8 py-4 rounded-xl bg-[#6f8f72] text-white font-semibold text-lg hover:bg-[#5e7a60] transition"
          >
            Start tracking
          </Link>

          <Link
            to="/login"
            className="px-8 py-4 rounded-xl border border-[#dfe6df] text-gray-700 hover:bg-[#eef3ee] transition"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="mt-24 flex justify-center px-6">
        <div className="bg-white border border-[#e4ebe4] rounded-3xl p-8 w-[900px] shadow-sm">

          <div className="flex justify-between mb-8">
            <div>
              <p className="text-gray-500 text-sm">Total balance</p>
              <p className="text-4xl font-bold mt-2">€12,450</p>
            </div>

            <div className="text-right">
              <p className="text-gray-500 text-sm">This month</p>
              <p className="text-[#6f8f72] font-semibold mt-2">
                + €2,140
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">

            <div className="bg-[#f3f6f3] p-5 rounded-xl">
              <p className="text-gray-500 text-sm">Income</p>
              <p className="text-xl font-bold mt-2">€5,200</p>
            </div>

            <div className="bg-[#f3f6f3] p-5 rounded-xl">
              <p className="text-gray-500 text-sm">Expenses</p>
              <p className="text-xl font-bold mt-2">€2,900</p>
            </div>

            <div className="bg-[#f3f6f3] p-5 rounded-xl">
              <p className="text-gray-500 text-sm">Saved</p>
              <p className="text-xl font-bold mt-2">€1,100</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
