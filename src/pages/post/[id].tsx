import Head from "next/head";
import type { GetStaticPaths, GetStaticPropsContext, InferGetServerSidePropsType} from "next";

import { api } from "~/utils/api";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";

type PageProps = InferGetServerSidePropsType<typeof getStaticProps>;
export default function SinglePostPage(props: PageProps) {
  const { id } = props;
  const { data } = api.posts.getById.useQuery({ id });

  if (!data) return <div>404</div>

  return (
    <>
      <Head>
        <title>{`${data.content} - @${data.author.name}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
}

export async function getStaticProps (
  context: GetStaticPropsContext<{ id: string }>
) {
  const ssg = await generateSSGHelper();
  
  const id = context.params?.id;
  if (typeof id !== "string") throw new Error("no slug");

  await ssg.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
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
