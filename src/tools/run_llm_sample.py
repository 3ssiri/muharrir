from __future__ import annotations

from pathlib import Path

from llm_judge_metrics.llm_runner import run_llm_tasks
from llm_judge_metrics.runner import run_metrics


def main() -> None:
    project_root = Path(__file__).resolve().parents[2]

    run_metrics(
        project_root=project_root,
        data_root=Path("data"),
        outputs_root=Path("outputs"),
        work_root=Path("work"),
        tag="latest",
        centers=None,
        models=None,
        match_score_threshold=0.5,
        export_excel=False,
        split_by="center-model",
        llm_task_scope="all",
    )

    run_llm_tasks(
        project_root=project_root,
        run_id="latest",
        channel_name="gala_api",
        judge_model="gemini-3-pro-preview-thinking",
        task_files=None,
        task_filter=None,
        max_tasks=0,
        sample_cases_per_center=4,
        require_all_models=True,
        case_sampling_strategy="stable_hash",
        sample_per_group=0,
        max_workers=20,
        temperature=0.0,
    )


if __name__ == "__main__":
    main()
