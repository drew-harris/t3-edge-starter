import { type NextPage } from "next";
import { api } from "~/utils/api";

const Hello: NextPage = () => {
  const { data } = api.example.hello.useQuery({
    text: "drew",
  });
  return <div>{JSON.stringify(data)}</div>;
};

export default Hello;
