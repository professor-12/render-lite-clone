import api from "@/app/client/client"
import { useQuery } from "@tanstack/react-query"

export const useGetUserRepos = ()=>{
    return useQuery({
        queryKey:["user-repos"],
        queryFn: async()=>{
            const {data} = await api.get("/github/repositories",
                {
                   
                }
                
            )
            return data.data
        },
        retry:2
    })
}
