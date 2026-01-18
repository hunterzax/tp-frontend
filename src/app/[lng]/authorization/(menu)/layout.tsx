import LayoutMenu from "@/components/layout/LayoutMenu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section>
        <LayoutMenu children={children} />
    </section>
  );
}
