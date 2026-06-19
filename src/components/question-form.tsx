'use client'

import { useState } from 'react'
import { Check, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslations } from 'next-intl'
// RadioGroup is missing, using native inputs

interface Question {
    id: string
    text: string
    type: 'text' | 'select' | 'checkbox'
    options?: string[]
}

interface QuestionFormProps {
    toolInvocation: any
    addToolResult: (result: { toolCallId: string; result: any }) => void
}

export function QuestionForm({ toolInvocation, addToolResult }: QuestionFormProps) {
    const t = useTranslations();
    const { toolCallId, args } = toolInvocation

    // Safely parse args to prevent crashes during streaming (partial JSON)
    let questions: Question[] = []
    try {
        const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args
        questions = parsedArgs?.questions || []
    } catch (e) {
        // If parsing fails (e.g. streaming incomplete JSON), use empty list
        // This prevents the white screen crash
        console.debug("Waiting for full JSON arguments...")
        questions = []
    }

    // Do not render form until we have questions
    if (!questions || questions.length === 0) {
        return (
            <Card className="p-4 bg-muted/30 animate-pulse">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm">{t('questionForm.analyzing')}</span>
                </div>
            </Card>
        )
    }

    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = () => {
        setSubmitted(true)
        // Format answers: "Question? Answer"
        const formattedResult = questions.map(q => {
            const ans = answers[q.id]
            return `${q.text}: ${Array.isArray(ans) ? ans.join(', ') : (ans || 'Skipped')}`
        }).join('\n')

        addToolResult({
            toolCallId,
            result: formattedResult
        })
    }

    // If result exists, show read-only state
    if ('result' in toolInvocation) {
        return (
            <Card className="p-4 bg-muted/30 border-dashed">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('questionForm.submitted')}</span>
                </div>
                <div className="text-sm space-y-1">
                    <div className="text-xs text-muted-foreground">{t('questionForm.detailsCompleted')}</div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-5 border-primary/20 shadow-sm animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{t('questionForm.title')}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t('questionForm.interactiveMode')}</span>
                </div>

                <div className="space-y-4">
                    {questions.map((q) => (
                        <div key={q.id} className="space-y-2">
                            <Label className="text-sm text-foreground/80">{q.text}</Label>

                            {q.type === 'text' && (
                                <Input
                                    value={answers[q.id] || ''}
                                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                    placeholder={t('questionForm.inputPlaceholder')}
                                    className="bg-background"
                                />
                            )}

                            {q.type === 'select' && q.options && (
                                <div className="flex flex-col gap-2">
                                    {q.options.map(opt => (
                                        <div key={opt} className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id={`${q.id}-${opt}`}
                                                name={q.id}
                                                value={opt}
                                                checked={answers[q.id] === opt}
                                                onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                className="aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                            <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {q.type === 'checkbox' && q.options && (
                                <div className="grid grid-cols-2 gap-2">
                                    {q.options.map(opt => (
                                        <div key={opt} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${q.id}-${opt}`}
                                                checked={(answers[q.id] || []).includes(opt)}
                                                onCheckedChange={(checked) => {
                                                    setAnswers(prev => {
                                                        const current = prev[q.id] || []
                                                        if (checked) return { ...prev, [q.id]: [...current, opt] }
                                                        else return { ...prev, [q.id]: current.filter((x: string) => x !== opt) }
                                                    })
                                                }}
                                            />
                                            <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <Button
                    onClick={handleSubmit}
                    className="w-full gap-2"
                    disabled={Object.keys(answers).length === 0}
                >
                    <Send className="w-4 h-4" />
                    {t('questionForm.submitButton')}
                </Button>
            </div>
        </Card>
    )
}
