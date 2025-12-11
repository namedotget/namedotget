import Link from "next/link";
import { useEffect, useState } from "react";

function Item({ item, link, index, arrLength }: any) {
  const [hover, setHover] = useState(false);
  const [isFirst, setIsFirst] = useState(false);
  const [isLast, setIsLast] = useState(false);

  useEffect(() => {
    if (index === 0) setIsFirst(true);
    else if (index === arrLength - 1) setIsLast(true);
  }, [index, arrLength]);

  return (
    <div
      className={`min-h-[80px] flex items-start justify-between p-5 border-b border-[#2d2d2d] bg-[#1d1d1d] ${
        isFirst ? "rounded-t-lg" : isLast ? "rounded-b-lg border-b-0" : ""
      } ease-in-out duration-300 hover:bg-[#252525] ${
        link ? "hover:border-l-2 hover:border-l-ndgGreen hover:pl-[18px]" : ""
      }`}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-center">
        <div>
          <h2
            className={`text-lg font-semibold text-ndgGreen ease-in-out duration-300 ${
              link && hover && "translate-x-1"
            }`}
          >
            {item.name}
            {link && (
              <span
                className={`ml-2 text-sm opacity-0 transition-opacity duration-300 ${
                  hover && "opacity-60"
                }`}
              >
                {"->"}
              </span>
            )}
          </h2>
          <p className="text-sm text-[#a0a0a0] w-full mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Items({ items, label, link = false }: any) {
  return (
    <div className="mt-6 flex flex-col gap-3 justify-center w-full font-mono">
      <h1 className="font-bold text-2xl text-center text-[#00000080]">
        {label}
      </h1>
      <div className="w-full glass h-full rounded-lg overflow-hidden border border-[#2d2d2d]">
        {items.map((item: any, i: number, arr: any[]) =>
          link && item.href ? (
            <Link key={i} href={item.href} target="_blank" rel="noreferrer">
              <Item item={item} link={link} index={i} arrLength={arr.length} />
            </Link>
          ) : (
            <Item
              key={i}
              item={item}
              link={false}
              index={i}
              arrLength={arr.length}
            />
          )
        )}
      </div>
    </div>
  );
}
