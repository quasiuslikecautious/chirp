import Head from "next/head";
import Image from "next/image";
import type { GetStaticPaths, GetStaticPropsContext, InferGetServerSidePropsType} from "next";

import { createServerSideHelpers } from "@trpc/react-query/server";

import { api } from "~/utils/api";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root"; 

import superjson from "superjson";

import { getSession } from "next-auth/react";
import { PageLayout } from "~/components/layout";

type PageProps = InferGetServerSidePropsType<typeof getStaticProps>;
export default function ProfilePage(props: PageProps) {
  const { name } = props;
  const { data } = api.profiles.getUserByName.useQuery({ name });

  if (!data) return <div>404</div>

  return (
    <>
      <Head>
        <title>{data.name}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.image!}
            alt={`${data.name}'s profile pic`}
            width={150}
            height={150}
            className="absolute bottom-0 left-0 -mb-[75px] ml-4 rounded-full border-4 border-black"
          />
        </div>
        <div className="h-[75px]" />
        <div className="p-4 text-2xl font-bold">{`@${data.name ?? ""}`}</div>
        <div className="border-b border-slate-400" />
      </PageLayout>
    </>
  );
}

export async function getStaticProps (
  context: GetStaticPropsContext<{ slug: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { 
      session: await getSession(), 
      prisma,
    },
    transformer: superjson,
  });

  
  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("no slug");

  const name = slug.replace("@", "");

  await helpers.profiles.getUserByName.prefetch({ name });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      name,
    },
    revalidate: 1,
  };
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [], 
    fallback: 'blocking',
  };
}
