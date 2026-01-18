"use client";
import { useEffect } from "react";
import { useTranslation } from "@/app/i18n/client";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ClientProps {
    // params: {
    //     lng: string;
    // };
}

const ClientPage: React.FC<ClientProps> = () => {
  const params = useParams();
  const lng = params.lng as string;
  const { t } = useTranslation(lng, "mainPage");

  // ใส่ useEffect และ use client เพื่อจำลองว่าเป็น client site
  // useEffect(() => {}, []);
  return (
    <>
      <h1>{`businessPartners`}</h1>
      <Link href={`/${lng}/authorization`} prefetch={true}>
          {`Back `}
      </Link>
    </>
  );
};

export default ClientPage;
