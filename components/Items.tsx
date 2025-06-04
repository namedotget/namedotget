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
      className={`min-h-[100px] flex items-start justify-between p-4 border-b border-[#2d2d2d] bg-[#1d1d1d] ${
        isFirst ? "rounded-t-md" : isLast ? "rounded-b-md" : ""
      } ease-in-out duration-300 hover:bg-[#2d2d2d]`}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-center">
        <div className="ml-4">
          <h2
            className={`text-lg font-semibold text-ndgGreen ease-in-out duration-300 ${
              link && hover && "text-[125%]"
            }`}
          >
            {item.name}
          </h2>
          <p className="text-sm text-[#a0a0a0] w-full">{item.description}</p>
        </div>
      </div>
    </div>
  );
}

export function Items({ items, label, link = false }: any) {
  return (
    <div className="mt-4 flex flex-col gap-2 justify-center w-full">
      <h1 className="font-bold text-2xl  text-center text-[#00000080]">
        {label}
      </h1>
      <div className="w-full glass h-full rounded-md">
        {items.map((item: any, i: number, arr: any[]) =>
          link ? (
            <Link
              key={i}
              href={link ? item.href : ""}
              target="_blank"
              rel="noreferrer"
            >
              <Item item={item} link={link} index={i} arrLength={arr.length} />
            </Link>
          ) : (
            <Item
              key={i}
              item={item}
              link={link}
              index={i}
              arrLength={arr.length}
            />
          )
        )}
      </div>
    </div>
  );
}
