import Head from "next/head";
import Image from "next/image";
import type { GetStaticPaths, GetStaticPropsContext, InferGetServerSidePropsType} from "next";

import { api } from "~/utils/api";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";

const ProfileFeed = (props: { userId: string}) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({ userId: props.userId });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.id} />
      ))}
    </div>
  );
};

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
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
}

export async function getStaticProps (
  context: GetStaticPropsContext<{ slug: string }>
) {
  const ssg = await generateSSGHelper();
  
  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("no slug");

  const name = slug.replace("@", "");

  await ssg.profiles.getUserByName.prefetch({ name });

  return {
    props: {
      trpcState: ssg.dehydrate(),
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
