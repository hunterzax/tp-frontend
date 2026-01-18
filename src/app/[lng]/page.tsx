import { getTranslation } from "@/app/i18n";

interface HomeProps {
  params: Promise<{
    lng: string;
  }>;
}

const HomePage: React.FC<HomeProps> = async (props) => {
  const { lng } = await props.params;
  const { t } = await getTranslation(lng);

  return (
    <>
      <h1 className=" text-red-300">{t("homePage")}</h1>
    </>
  );
};

export default HomePage;