'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, RefreshCw, Sparkles, Send, Maximize2, X, Star } from '@/components/icons'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/lib/db'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface PromptProposal {
    title: string
    role: string
    objective: string
    context?: string
    constraints?: string | string[]
    workflow?: string | string[]
    outputFormat?: string
    finalPrompt?: string
    final_prompt?: string  // For backward compatibility with the old format
}

interface PromptProposalCardProps {
    toolInvocation: any
    addToolResult: (result: { toolCallId: string; result: any }) => void
}

export function PromptProposalCard({ toolInvocation, addToolResult }: PromptProposalCardProps) {
    const t = useTranslations();
    const { toolCallId, args } = toolInvocation
    const [copied, setCopied] = useState(false)
    const [accepted, setAccepted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [favorited, setFavorited] = useState(false)
    const [favoriteId, setFavoriteId] = useState<number | null>(null)
    // User edits to the final prompt (null = untouched, follows the model output)
    const [edited, setEdited] = useState<string | null>(null)

    // Parse args safely
    let proposal: PromptProposal | null = null
    try {
        proposal = typeof args === 'string' ? JSON.parse(args) : args
    } catch (e) {
        // Partial JSON during streaming
    }

    // The prompt currently shown: the user's edit if any, else the model output
    const finalPromptValue = proposal?.finalPrompt || proposal?.final_prompt || ''
    const promptText = edited ?? finalPromptValue

    // Check whether it has been added to favorites
    useEffect(() => {
        const checkFavorite = async () => {
            if (!proposal?.finalPrompt && !proposal?.final_prompt) return

            const finalPrompt = proposal.finalPrompt || proposal.final_prompt || ''
            const existing = await db.favoritePrompts
                .where('content')
                .equals(finalPrompt)
                .first()

            if (existing) {
                setFavorited(true)
                setFavoriteId(existing.id!)
            }
        }
        checkFavorite()
    }, [proposal?.finalPrompt, proposal?.final_prompt])

    if (!proposal || !proposal.title) {
        return (
            <Card className="flex items-center justify-center p-6 border-dashed animate-pulse">
                <Sparkles className="w-5 h-5 text-primary animate-spin me-2" />
                <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
            </Card>
        )
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(promptText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleAccept = () => {
        setAccepted(true)
        addToolResult({
            toolCallId,
            result: "User accepted the prompt proposal."
        })
    }

    const handleIterate = () => {
        // Technically this should trigger a user message?
        // Or we just send a result saying "I want changes"?
        // For now, let's just make it a visual action that tells user to type.
    }

    const handleFavorite = async () => {
        const finalPrompt = promptText
        const title = proposal?.title || t('promptProposal.title')

        if (favorited && favoriteId) {
            // Remove from favorites
            await db.favoritePrompts.delete(favoriteId)
            setFavorited(false)
            setFavoriteId(null)
            toast.success(t('promptProposal.favoriteRemoved'))
        } else {
            // Add to favorites
            const id = await db.favoritePrompts.add({
                title,
                content: finalPrompt,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            setFavorited(true)
            setFavoriteId(id as number)
            toast.success(t('promptProposal.favoriteAdded'))
        }
    }

    if (accepted || 'result' in toolInvocation) {
        return (
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="py-4">
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base">{t('promptProposal.accepted', { title: proposal.title })}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="py-2">
                    <div className="text-sm text-muted-foreground line-clamp-2">
                        {promptText}
                    </div>
                </CardContent>
                <CardFooter className="py-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="w-4 h-4 me-1" /> : <Copy className="w-4 h-4 me-1" />}
                        {t('promptProposal.copy')}
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <>
        <Card className="w-full max-w-5xl border-border shadow-elevated overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 py-0 gap-0">
            <CardHeader className="bg-primary text-primary-foreground pb-4 pt-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        <CardTitle className="text-lg text-primary-foreground">{proposal.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="secondary"
                            className={`h-8 w-8 transition-colors border-0 ${favorited ? 'bg-gold hover:bg-gold/90 text-gold-foreground' : 'bg-white/20 hover:bg-white/30 text-primary-foreground'}`}
                            onClick={handleFavorite}
                            title={favorited ? t('promptProposal.unfavorite') : t('promptProposal.favorite')}
                        >
                            <Star className={`w-4 h-4 transition-all duration-300 ${favorited ? 'fill-current' : ''}`} />
                        </Button>
                        <Badge variant="outline" className="bg-white/15 text-primary-foreground border-white/30">{t('promptProposal.structuredBadge')}</Badge>
                    </div>
                </div>
            </CardHeader>

            <Tabs defaultValue="structure" className="w-full">
                <div className="px-6 border-b bg-muted/10">
                    <TabsList className="h-10 bg-transparent p-0">
                        <TabsTrigger value="preview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                            {t('promptProposal.tabPreview')}
                        </TabsTrigger>
                        <TabsTrigger value="structure" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                            {t('promptProposal.tabStructure')}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <CardContent className="p-0">
                    <TabsContent value="preview" className="m-0">
                        <div className="p-6 bg-card">
                            <Label className="mb-2 block text-muted-foreground">{t('promptProposal.finalPrompt')}</Label>
                            <div className="relative">
                                <Textarea
                                    className="min-h-[200px] font-mono text-sm leading-relaxed bg-muted/20 resize-none focus-visible:ring-1"
                                    value={promptText}
                                    onChange={(e) => setEdited(e.target.value)}
                                    spellCheck={false}
                                />
                                <div className="absolute top-2 end-2 flex gap-2">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8 opacity-80 hover:opacity-100"
                                        onClick={() => setIsFullscreen(true)}
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8 opacity-80 hover:opacity-100"
                                        onClick={handleCopy}
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="structure" className="m-0 p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">{t('promptProposal.role')}</Label>
                                <div className="p-3 bg-muted/30 rounded-md text-sm">{proposal.role}</div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">{t('promptProposal.objective')}</Label>
                                <div className="p-3 bg-muted/30 rounded-md text-sm">{proposal.objective}</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">{t('promptProposal.context')}</Label>
                            <div className="p-3 bg-muted/30 rounded-md text-sm whitespace-pre-wrap">{proposal.context}</div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">{t('promptProposal.workflow')}</Label>
                            <div className="p-3 bg-muted/30 rounded-md text-sm whitespace-pre-wrap">{proposal.workflow || t('promptProposal.noWorkflow')}</div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">{t('promptProposal.constraints')}</Label>
                            <div className="p-3 bg-muted/30 rounded-md text-sm whitespace-pre-wrap border-s-2 border-destructive ps-3">{proposal.constraints}</div>
                        </div>
                    </TabsContent>
                </CardContent>
            </Tabs>

            <CardFooter className="bg-muted/30 p-4 flex justify-between gap-4">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {t('promptProposal.modificationsHint')}
                </div>
                <div className="flex gap-2">
                    <Button variant="default" onClick={handleAccept} className="gap-2">
                        <Check className="w-4 h-4" />
                        {t('promptProposal.accept')}
                    </Button>
                </div>
            </CardFooter>
        </Card>

        {/* Full-screen modal */}
        {isFullscreen && (
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-2">
                <div className="w-full max-w-[95vw] h-[95vh] flex flex-col bg-card border rounded-lg shadow-2xl">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-semibold">{t('promptProposal.previewHeading')}</h3>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setIsFullscreen(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-auto p-6">
                        <Textarea
                            className="w-full h-full font-mono text-sm leading-relaxed bg-muted/20 resize-none focus-visible:ring-1"
                            value={promptText}
                            onChange={(e) => setEdited(e.target.value)}
                            spellCheck={false}
                        />
                    </div>
                    <div className="p-4 border-t flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsFullscreen(false)}>
                            {t('common.close')}
                        </Button>
                        <Button onClick={handleCopy}>
                            {copied ? <Check className="w-4 h-4 me-2" /> : <Copy className="w-4 h-4 me-2" />}
                            {t('promptProposal.copy')}
                        </Button>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}
