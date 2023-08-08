import Image from "next/image";
import Link from "next/link";

import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
  return (
    <>
      <div key={props.id} className="flex border-b border-slate-400 p-4 items-center gap-3">
        <Image
          src={props.author.image!}
          className="h-14 w-14 rounded-full"
          alt={`@{props.author.name}'s profile picture`}
          width={56}
          height={56}
        />
        <div className="flex flex-col">
          <Link href={`/@${props.author.name}`}>
            <div className="flex text-slate-300 gap-1">
              <span>{`@${props.author.name}`}</span>
              <span className="font-thin">·</span>
              <span className="font-thin">{dayjs(props.createdAt).fromNow()}</span>
            </div>
          </Link>
          <Link href={`/post/${props.id}`}>
            <span className="text-2xl">{props.content}</span>
          </Link>
        </div>
      </div>
    </>
  );
};
