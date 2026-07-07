# مسودة طلب منحة OSS لمشروع Muharrir

> ملاحظة: لا تستخدم هذه النصوص للتقديم النهائي قبل أن يصبح المستودع عاما، والرخصة مفتوحة، وREADME محدث، وCI ناجح.

## وصف قصير جدا

Muharrir is a local-first Arabic/English prompt engineering workspace that helps users turn vague ideas, documents, and requirements into structured, reusable AI prompts through guided multi-step refinement.

## وصف قصير بالعربية

محرر مساحة عمل محلية أولا بالعربية والإنجليزية تساعد المستخدمين على تحويل الأفكار والمستندات والمتطلبات الغامضة إلى موجهات ذكاء اصطناعي منظمة وقابلة لإعادة الاستخدام عبر تحسين تفاعلي متعدد الجولات.

## وصف متوسط

Muharrir is an open-source, local-first prompt engineering workspace built for Arabic and English users. It helps developers, educators, researchers, and content creators turn vague ideas, long documents, and rough requirements into structured AI prompts through a guided multi-step workflow. Instead of acting as a generic chat interface, Muharrir focuses on prompt refinement: asking clarifying questions, suggesting enhancement options, producing final reusable prompts, and helping users save, compare, and export their work. The project supports RTL Arabic, multi-provider OpenAI-compatible endpoints, browser-based document parsing, and a desktop mode through Tauri for better privacy and local key handling.

## وصف طويل

Muharrir is an open-source, local-first Arabic/English prompt engineering workspace designed to make high-quality AI prompting more accessible, reusable, and privacy-conscious.

Many AI users struggle to convert vague ideas into clear, actionable prompts. This is especially true for Arabic-speaking users, educators, developers, and content creators who need structured prompts for coding agents, research tasks, educational content, document analysis, and long-form writing. Existing tools often focus on generic chat, simple prompt templates, or cloud-based workflows that do not fully support Arabic, RTL interfaces, local privacy, or multi-step prompt refinement.

Muharrir approaches the problem differently. It guides users through an interactive workflow: starting with a rough idea, asking clarifying questions, suggesting improvements across multiple dimensions, and producing a structured final prompt that can be copied, saved, compared, or reused. The project is built with Next.js, TypeScript, Tailwind, shadcn/ui, Zustand, Dexie/IndexedDB, and Tauri. It supports Arabic and English, local-first storage, browser-side PDF/DOCX parsing, OpenAI-compatible provider settings, and desktop deployment.

The long-term goal is to provide a trustworthy open-source workspace for prompt engineering, especially for Arabic-first and privacy-conscious workflows. Muharrir is not a closed cloud service and does not require users to store their prompts or API keys on a central server. It aims to become a practical tool for developers, educators, and AI builders who want to create better prompts while keeping control of their data.

## المشكلة التي يحلها المشروع

AI tools are powerful, but prompt quality remains a bottleneck. Users often begin with unclear ideas, incomplete requirements, or long documents, then struggle to turn them into prompts that produce reliable results. This leads to wasted tokens, inconsistent outputs, and repeated trial-and-error.

For Arabic-speaking users, the problem is larger:

- Few tools are Arabic-first.
- RTL support is often weak.
- Arabic prompt examples are limited.
- Privacy-conscious local workflows are uncommon.
- Many tools are cloud-first and generic.

Muharrir solves this by providing a guided, local-first workspace for prompt refinement.

## لماذا المشروع مهم للمصدر المفتوح؟

Muharrir contributes to open source by filling a gap in Arabic-first AI tooling. Most prompt engineering tools are either proprietary, English-first, cloud-hosted, or template-based. Muharrir provides an open, inspectable, modifiable alternative that users can run locally, adapt to their providers, and extend with new prompt workflows.

It is useful for:

- Developers building prompts for coding agents.
- Educators designing AI-assisted learning tasks.
- Researchers converting documents into structured AI instructions.
- Arabic-speaking creators who need strong RTL support.
- Privacy-conscious users who prefer local-first tools.

## ما الذي يجعله مختلفا؟

1. **Arabic-first and bilingual**: Arabic is not an afterthought. The interface supports RTL and bilingual workflows.
2. **Local-first privacy**: Conversations and settings are stored locally, not on a central project server.
3. **Desktop-ready**: Tauri support enables a desktop workflow with better API key handling through OS Keychain.
4. **Prompt refinement workflow**: The project focuses on guided improvement, not just chatting.
5. **Document-to-prompt**: Users can extract context from PDF/DOCX and turn it into structured prompts.
6. **Multi-provider**: Users can configure OpenAI-compatible providers instead of being locked into one vendor.

## من يخدم؟

- Open-source maintainers who write prompts for code review, documentation, and issue triage.
- Developers who use AI coding agents.
- Teachers and trainers who generate learning activities and rubrics.
- Arabic-speaking professionals who need high-quality AI instructions.
- Researchers and writers who work with long documents.
- Privacy-conscious users who prefer local-first tooling.

## خطة الستة أشهر القادمة

### Month 1

- Finalize OSS licensing and governance.
- Improve README and onboarding.
- Add demo mode for first-time users.
- Add privacy and security documentation.
- Improve CI: lint, typecheck, unit tests, build.

### Month 2

- Add provider profiles and troubleshooting docs.
- Improve Arabic prompt templates.
- Add screenshots and demo video.
- Publish first public release.
- Open good-first-issue tasks.

### Month 3

- Add Prompt Packs import/export.
- Add Prompt Evaluation score.
- Improve document-to-prompt flow.
- Add Playwright smoke tests.

### Month 4

- Improve Tauri desktop release workflow.
- Add local model setup guide for Ollama/LM Studio.
- Improve accessibility and mobile usability.

### Month 5

- Add workspace mode for organizing prompt projects.
- Add prompt versioning and diff improvements.
- Expand Arabic and English prompt examples.

### Month 6

- Prepare community prompt packs.
- Improve contribution documentation.
- Evaluate user feedback and prioritize next roadmap.

## كيف سيساعد الدعم؟

Support would help maintain and improve Muharrir by enabling more focused development time on:

- stronger test coverage,
- better desktop releases,
- provider compatibility,
- Arabic prompt quality,
- documentation and onboarding,
- community-ready contribution workflows.

It would also help keep the project open, local-first, and independent rather than turning it into a closed hosted service.

## أدلة الجدية والجودة

Before submitting, update this section with real links:

- Repository: TODO
- Release: TODO
- CI status: TODO
- Demo video/GIF: TODO
- Documentation: TODO
- Roadmap: TODO
- Privacy docs: TODO
- Good first issues: TODO

## نقاط يجب عدم ادعائها

لا تذكر أي من التالي إلا إذا تحقق فعلا:

- وجود آلاف المستخدمين.
- وجود مساهمين خارجيين.
- وجود اعتماد من جهة رسمية.
- أن المشروع critical infrastructure.
- أن المشروع يحفظ المفاتيح بطريقة مثالية في كل البيئات.
- أن كل المزودين يعملون من المتصفح بدون CORS.

## صياغة طلب مختصرة جاهزة

Muharrir is my open-source Arabic/English, local-first prompt engineering workspace. It helps users transform vague ideas, documents, and rough requirements into structured, reusable AI prompts through guided multi-step refinement. The project is especially focused on Arabic-first workflows, RTL support, privacy-conscious local storage, multi-provider OpenAI-compatible configuration, and desktop use through Tauri. I am applying because I want to develop Muharrir into a reliable OSS tool for developers, educators, and AI builders who need better prompt workflows without relying on a closed cloud service.

## صياغة عربية لاستخدامها في الشرح

محرر مشروع مفتوح المصدر يهدف إلى سد فجوة واضحة في أدوات الذكاء الاصطناعي العربية. أغلب الأدوات الحالية إما إنجليزية أولا، أو مجرد واجهات دردشة، أو خدمات مغلقة. محرر يقدم مساحة عمل محلية أولا لتحسين الموجهات، تدعم العربية والإنجليزية، وتساعد المستخدم على تحويل الفكرة الخام أو المستند الطويل إلى Prompt منظم وقابل لإعادة الاستخدام. قوته في أنه لا يجمع بيانات المستخدم على خادم مركزي، ويدعم مزودين متعددين، ويمكن تشغيله كتطبيق ويب أو سطح مكتب.

## قائمة تحقق قبل إرسال الطلب

- [ ] Repository is public.
- [ ] License is open and consistent.
- [ ] README is updated.
- [ ] Demo mode works.
- [ ] CI is green.
- [ ] Release exists.
- [ ] Screenshots or video exist.
- [ ] Privacy docs exist.
- [ ] Security docs exist.
- [ ] Roadmap exists.
- [ ] Good first issues exist.
