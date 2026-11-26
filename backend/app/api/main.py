"""FastAPI application (Kap. 10). `uvicorn --factory app.api.main:create_app`; store root from CIRA_DATA
(default ./experiments)."""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ..contracts.common import ErrorCodeC, FieldId
from ..contracts.f07 import ErrorBody, ErrorDetail, ErrorResponse
from ..core.errors import CiraError, ErrorCode
from ..experiments.control import Control
from ..store import ArtifactStore
from .routers import router

STATUS = {ErrorCode.NOT_FOUND: 404, ErrorCode.CONFLICT: 409, ErrorCode.SCHEMA_VIOLATION: 422,
          ErrorCode.INVALID_TOPOLOGY: 422, ErrorCode.INVALID_RULE: 422, ErrorCode.INVALID_TRANSITION: 422,
          ErrorCode.IMPORT_INVALID: 422, ErrorCode.COMPARISON_INCOMPATIBLE: 422, ErrorCode.ACCESS_VIOLATION: 500}


def error_json(code: ErrorCode, msg: str, field: str | None, details: tuple[tuple[str, str], ...],
               exp: str | None = None) -> dict[str, object]:
    body = ErrorResponse(error=ErrorBody(code=ErrorCodeC(code.value), message=msg,
                                         field=FieldId(field) if field in {f.value for f in FieldId} else None,
                                         details=tuple(ErrorDetail(path=p, issue=i) for p, i in details),
                                         experiment_id=exp))
    return body.model_dump(mode="json")


def create_app(data_dir: str | Path | None = None, background: bool = True) -> FastAPI:
    root = Path(data_dir or os.environ.get("CIRA_DATA", "experiments"))
    app = FastAPI(title="CIRA API", version="1.0.2")
    app.state.control = Control(ArtifactStore(root), background=background)
    app.add_middleware(CORSMiddleware, allow_origins=["http://127.0.0.1:5173", "http://localhost:5173",
                                                      "http://127.0.0.1:4173", "http://localhost:4173"],
                       allow_methods=["*"], allow_headers=["*"])

    @app.exception_handler(CiraError)
    async def _cira(_: Request, e: CiraError) -> JSONResponse:
        exp = next((s for s in e.subjects if s.startswith("exp:")), None)
        return JSONResponse(error_json(e.code, e.message, e.field, e.details, exp), status_code=STATUS.get(e.code, 422))

    @app.exception_handler(RequestValidationError)
    async def _val(_: Request, e: RequestValidationError) -> JSONResponse:
        det = tuple((".".join(str(x) for x in err.get("loc", ())), str(err.get("msg", ""))) for err in e.errors())
        return JSONResponse(error_json(ErrorCode.SCHEMA_VIOLATION, "request does not match the contract", None, det),
                            status_code=422)

    @app.exception_handler(ValueError)
    async def _value(_: Request, e: ValueError) -> JSONResponse:
        return JSONResponse(error_json(ErrorCode.SCHEMA_VIOLATION, str(e)[:500], None, ()), status_code=422)

    app.include_router(router)
    return app

