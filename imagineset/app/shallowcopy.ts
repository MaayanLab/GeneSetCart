'use server'
import prisma from "@/lib/prisma";
import { addToSessionSetsGeneObj } from "./assemble/[id]/AssembleFunctions ";
import { Gene, GeneSet, PipelineSession, User } from "@prisma/client";
import { redirect } from "next/navigation";
import Cookies from 'js-cookie'

export async function shallowCopy(user: User,
    sessionInfo:
        (({
            gene_sets: ({
                genes: Gene[];
            } & GeneSet)[]
        } & PipelineSession | null)),
    redirectPage: string,
    anonUser: boolean, 
    searchParams: Record<string, string | string[] | undefined>
) {
    if (sessionInfo) {
        if (sessionInfo.private === false) {
            const sessionSets = sessionInfo.gene_sets // get gene sets of shared session
            const newSession = await prisma.pipelineSession.create({
                data: {
                    user_id: user.id,
                    private: !anonUser

                },
            })
            await Promise.all(sessionSets.map(async (sessionGeneset) => await addToSessionSetsGeneObj(sessionGeneset.genes, newSession.id, sessionGeneset.name, sessionGeneset.description ? sessionGeneset.description : '', user)))
            const queryParamString = Object.keys(searchParams).map((key) => `${key}=${searchParams[key]}`).join('&')
            const inOneHour = new Date(new Date().getTime() + 60 * 60 * 1000);
            Cookies.set('session_id', newSession.id, { secure: true, expires: inOneHour })
            return redirect(Object.values(searchParams).includes(undefined) ? `/${redirectPage}/${newSession.id}` : `/${redirectPage}/${newSession.id}?${queryParamString}`)
        } else {
            return redirect('/') // redirect to homepage if session does not exist or is a private session
        }
    } else {
        return redirect('/') // redirect to homepage if session does not exist or is a private session
    }
}