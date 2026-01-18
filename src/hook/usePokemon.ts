import { useQuery } from "@tanstack/react-query";
import { axiosInstanceDemo } from "@/utils/axiosInstance";

export const usePokemon = (name: string) => {
  return useQuery({
    queryKey: ["pokemon"],
    queryFn: async () => {
      const { data } = await axiosInstanceDemo.get(`/pokemon/${name}`);
      return data;
    },
    enabled: !!name, // enable query only if name is not empty
    staleTime: 1000 * 60, // 1 minute
  });
};

export const usePokemonAll = (name: string) => {
  return useQuery({
    queryKey: ["pokemonAll"],
    queryFn: async () => {
      const { data } = await axiosInstanceDemo.get(name);
      return data;
    },
    enabled: !!name, // enable query only if name is not empty
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: 'always',
  });
};
