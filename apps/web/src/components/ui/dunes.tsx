import Image from "next/image";

export function Dunes() {
  return (
    <div className="m-6 hidden w-full md:block lg:block">
      <Image
        className="hidden h-full w-full rounded-xl object-cover dark:flex"
        src={"/assets/dunes-login-dark.png"}
        alt="Analogia dunes dark"
        width={1000}
        height={1000}
      />
      <Image
        className="flex h-full w-full rounded-xl object-cover dark:hidden"
        src={"/assets/dunes-login-light.png"}
        alt="Analogia dunes light"
        width={1000}
        height={1000}
      />
    </div>
  );
}
