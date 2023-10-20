import Link from "next/link";

export function Items({ items, label, link = false }: any) {
  return (
    <div className="mt-4 flex flex-col gap-2 justify-center w-full md:w-1/2">
      <h1 className="font-bold text-2xl  text-center text-[#00000080]">
        {label}
      </h1>
      <div className="px-4 py-2 w-full glass h-full bg-[#1d1d1d] rounded-md">
        {items.map((item: any, i: number) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-[#2d2d2d]"
          >
            <div className="flex items-center">
              <div className="ml-4">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-sm text-[#a0a0a0] w-full">
                  {item.description}
                </p>
              </div>
            </div>
            {link && (
              <button
                className="px-6 py-2 rounded-md bg-[#2d2d2d] text-[#a0a0a0]"
                onClick={() => window.open(item.href)}
              >
                →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
