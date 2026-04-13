import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { apartments } from "./data/apartments";
import type { ApartmentCandidate, CommuteLevel } from "./types";

type SortOption = "balance" | "price" | "transit" | "education";
type RecommendationMode = "commuter" | "budget" | "family";

type ScoreProfile = {
  total: number;
  housingFit: number;
  costFit: number;
  familyFit: number;
};

function score(candidate: ApartmentCandidate): number {
  return Math.round(
    candidate.transitScore * 0.3 +
      candidate.convenienceScore * 0.25 +
      candidate.educationScore * 0.2 +
      candidate.environmentScore * 0.25
  );
}

function weightedScore(candidate: ApartmentCandidate, mode: RecommendationMode): number {
  if (mode === "commuter") {
    return Math.round(
      candidate.transitScore * 0.45 +
        candidate.convenienceScore * 0.25 +
        candidate.environmentScore * 0.15 +
        candidate.educationScore * 0.15
    );
  }

  if (mode === "budget") {
    return Math.round(
      candidate.environmentScore * 0.2 +
        candidate.convenienceScore * 0.2 +
        candidate.educationScore * 0.15 +
        candidate.transitScore * 0.15
    );
  }

  if (mode === "family") {
    return Math.round(
      candidate.educationScore * 0.4 +
        candidate.environmentScore * 0.3 +
        candidate.convenienceScore * 0.2 +
        candidate.transitScore * 0.1
    );
  }

  return score(candidate);
}

function scoreProfile(
  candidate: ApartmentCandidate,
  budget: number,
  mode: RecommendationMode
): ScoreProfile {
  const total = weightedScore(candidate, mode);
  const housingFit = Math.round(
    candidate.transitScore * 0.4 +
      candidate.convenienceScore * 0.25 +
      candidate.environmentScore * 0.35
  );
  const costFit = Math.max(
    40,
    Math.min(100, Math.round(100 - Math.max(0, candidate.price억 - budget) * 12 + (budget - candidate.price억) * 3))
  );
  const familyFit = Math.round(
    candidate.educationScore * 0.45 +
      candidate.environmentScore * 0.35 +
      candidate.convenienceScore * 0.2
  );

  return {
    total,
    housingFit,
    costFit,
    familyFit
  };
}

function commuteRank(level: CommuteLevel): number {
  switch (level) {
    case "도보권":
      return 0;
    case "대중교통 30분":
      return 1;
    default:
      return 2;
  }
}

function lifestyleSummary(candidate: ApartmentCandidate): string {
  if (candidate.environmentScore >= 90 && candidate.educationScore >= 85) {
    return "가족형 장기 거주 관점에서 안정적인 생활권";
  }

  if (candidate.transitScore >= 90 && candidate.convenienceScore >= 88) {
    return "직주근접과 생활 편의 중심의 도심형 생활권";
  }

  if (candidate.price억 <= 11) {
    return "예산 효율과 생활 환경의 균형을 노리는 선택지";
  }

  return "생활권 균형이 좋아 비교 후보로 유지할 가치가 높은 선택지";
}

function scoreBreakdown(candidate: ApartmentCandidate, mode: RecommendationMode): string {
  if (mode === "commuter") {
    return "출퇴근과 생활 편의를 우선하는 직주근접 중심 추천 결과";
  }

  if (mode === "budget") {
    return "예산 부담과 생활 환경의 균형을 우선하는 추천 결과";
  }

  if (mode === "family") {
    return "학군과 주거 환경을 함께 보는 가족형 추천 결과";
  }

  if (candidate.transitScore >= 90 && candidate.convenienceScore >= 85) {
    return "직주근접과 생활 편의가 모두 강한 도심형 선택지";
  }

  if (candidate.educationScore >= 88 && candidate.environmentScore >= 88) {
    return "학군과 쾌적성을 함께 보는 가족형 선택지";
  }

  if (candidate.price억 <= 11 && candidate.environmentScore >= 85) {
    return "예산 효율과 쾌적함을 동시에 노릴 수 있는 외곽형 선택지";
  }

  return "가격, 생활권, 이동 시간을 균형 있게 비교할 가치가 있는 후보";
}

function recommendationReasons(
  candidate: ApartmentCandidate,
  budget: number,
  mode: RecommendationMode
): string[] {
  const reasons: string[] = [];

  if (mode === "commuter") {
    if (candidate.transitScore >= 88) {
      reasons.push("출퇴근 동선이 짧아 직주근접 관점에서 우선 검토할 만하다.");
    }
    if (candidate.convenienceScore >= 82) {
      reasons.push("생활 편의시설 접근성이 좋아 평일 생활 동선이 안정적이다.");
    }
    if (reasons.length === 0) {
      reasons.push("출퇴근과 생활 편의가 모두 평균 이상이라 직주근접 대안으로 유지할 가치가 있다.");
    }
    return reasons.slice(0, 3);
  }

  if (mode === "budget") {
    if (candidate.price억 <= budget - 2) {
      reasons.push("현재 예산 대비 여유가 있어 자금 부담을 낮추기 좋다.");
    }
    if (candidate.environmentScore >= 85) {
      reasons.push("예산 효율만이 아니라 생활 환경도 충분히 확보할 수 있다.");
    }
    if (reasons.length === 0) {
      reasons.push("예산 안에서 교통과 생활권이 과하게 무너지지 않는 균형형 선택지다.");
    }
    return reasons.slice(0, 3);
  }

  if (mode === "family") {
    if (candidate.educationScore >= 88) {
      reasons.push("학군 점수가 높아 장기 거주 관점에서 안정적이다.");
    }
    if (candidate.environmentScore >= 88) {
      reasons.push("공원과 주거 환경이 좋아 가족형 생활 리듬과 잘 맞는다.");
    }
    if (reasons.length === 0) {
      reasons.push("교육과 환경이 모두 평균 이상이라 가족형 후보로 비교할 가치가 있다.");
    }
    return reasons.slice(0, 3);
  }

  if (candidate.transitScore >= 90) {
    reasons.push("출퇴근 동선이 짧고 직주근접 관점에서 강점이 있다.");
  }

  if (candidate.educationScore >= 88 && candidate.environmentScore >= 88) {
    reasons.push("학군과 주거 환경이 모두 안정적이라 가족형 수요에 유리하다.");
  }

  if (candidate.price억 <= budget - 2) {
    reasons.push("현재 예산 대비 여유가 있어 자금 부담이 상대적으로 적다.");
  }

  if (candidate.convenienceScore >= 85) {
    reasons.push("대형마트, 병원, 상권 접근성이 좋아 생활 편의가 높다.");
  }

  if (reasons.length === 0) {
    reasons.push("교통, 가격, 생활권이 극단적으로 치우치지 않아 비교 후보로 유지할 가치가 있다.");
  }

  return reasons.slice(0, 3);
}

function MapViewport({
  latitude,
  longitude
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 12), {
      duration: 0.8
    });
  }, [latitude, longitude, map]);

  return null;
}

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("전체");
  const [budget, setBudget] = useState(18);
  const [maxCommute, setMaxCommute] = useState<CommuteLevel>("대중교통 45분");
  const [sortOption, setSortOption] = useState<SortOption>("balance");
  const [recommendationMode, setRecommendationMode] = useState<RecommendationMode>("commuter");
  const [selectedIds, setSelectedIds] = useState<string[]>(["mapo-river", "bundang-central"]);
  const [focusedId, setFocusedId] = useState<string>("mapo-river");

  const districts = useMemo(
    () => ["전체", ...new Set(apartments.map((candidate) => candidate.district))],
    []
  );

  const filteredCandidates = useMemo(() => {
    return apartments
      .filter((candidate) => {
        const matchesKeyword =
          keyword.trim().length === 0 ||
          candidate.name.toLowerCase().includes(keyword.toLowerCase()) ||
          candidate.summary.toLowerCase().includes(keyword.toLowerCase());
        const matchesDistrict =
          selectedDistrict === "전체" || candidate.district === selectedDistrict;
        const matchesBudget = candidate.price억 <= budget;
        const matchesCommute =
          commuteRank(candidate.commute) <= commuteRank(maxCommute);

        return matchesKeyword && matchesDistrict && matchesBudget && matchesCommute;
      })
      .sort((left, right) => {
        if (sortOption === "price") {
          return left.price억 - right.price억;
        }

        if (sortOption === "transit") {
          return right.transitScore - left.transitScore;
        }

        if (sortOption === "education") {
          return right.educationScore - left.educationScore;
        }

        return weightedScore(right, recommendationMode) - weightedScore(left, recommendationMode);
      });
  }, [budget, keyword, maxCommute, recommendationMode, selectedDistrict, sortOption]);

  const focusedCandidate =
    apartments.find((candidate) => candidate.id === focusedId) ?? filteredCandidates[0] ?? apartments[0];

  const comparedCandidates = selectedIds
    .map((id) => apartments.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is ApartmentCandidate => candidate != null);

  const focusedScoreProfile = scoreProfile(focusedCandidate, budget, recommendationMode);
  const focusedReasons = recommendationReasons(focusedCandidate, budget, recommendationMode);

  const averageBudget = Math.round(
    filteredCandidates.reduce((sum, candidate) => sum + candidate.price억, 0) /
      Math.max(filteredCandidates.length, 1)
  );
  const compareRows: Array<{
    label: string;
    formatter: (candidate: ApartmentCandidate) => string;
  }> = [
    { label: "매매가", formatter: (candidate) => `${candidate.price억}억` },
    { label: "출퇴근", formatter: (candidate) => candidate.commute },
    { label: "교통 점수", formatter: (candidate) => `${candidate.transitScore}` },
    { label: "생활 점수", formatter: (candidate) => `${candidate.convenienceScore}` },
    { label: "교육 점수", formatter: (candidate) => `${candidate.educationScore}` },
    { label: "환경 점수", formatter: (candidate) => `${candidate.environmentScore}` }
  ];

  function toggleCompare(candidateId: string) {
    setSelectedIds((current) => {
      if (current.includes(candidateId)) {
        return current.filter((id) => id !== candidateId);
      }

      if (current.length >= 3) {
        return [...current.slice(1), candidateId];
      }

      return [...current, candidateId];
    });
  }

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Housing Decision Tool</p>
          <h1>입지와 생활권을 함께 비교하는 주거 선택 지원 MVP</h1>
          <p className="hero-copy">
            HomeHarmony는 단순 매물 조회가 아니라 출퇴근, 생활 편의, 교육, 주거 환경을 함께 비교해서
            선택을 돕는 주거 의사결정 프로토타입이다.
          </p>
        </div>
        <div className="hero-metrics">
          <article>
            <span>현재 후보 수</span>
            <strong>{filteredCandidates.length}</strong>
          </article>
          <article>
            <span>평균 예산</span>
            <strong>{averageBudget}억</strong>
          </article>
          <article>
            <span>비교 중</span>
            <strong>{comparedCandidates.length}개</strong>
          </article>
        </div>
      </section>

      <section className="filter-section">
        <label>
          <span>키워드</span>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="아파트명 또는 설명"
          />
        </label>
        <label>
          <span>지역</span>
          <select
            value={selectedDistrict}
            onChange={(event) => setSelectedDistrict(event.target.value)}
          >
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>최대 예산</span>
          <input
            type="range"
            min="9"
            max="18"
            step="1"
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
          />
          <strong>{budget}억 이하</strong>
        </label>
        <label>
          <span>출퇴근 허용 범위</span>
          <select
            value={maxCommute}
            onChange={(event) => setMaxCommute(event.target.value as CommuteLevel)}
          >
            <option value="도보권">도보권</option>
            <option value="대중교통 30분">대중교통 30분</option>
            <option value="대중교통 45분">대중교통 45분</option>
          </select>
        </label>
        <label>
          <span>정렬</span>
          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value as SortOption)}
          >
            <option value="balance">균형 점수순</option>
            <option value="price">가격 낮은 순</option>
            <option value="transit">교통 점수순</option>
            <option value="education">교육 점수순</option>
          </select>
        </label>
      </section>

      <section className="mode-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Recommendation Mode</p>
            <h2>추천 기준 선택</h2>
          </div>
          <p className="mode-summary">
            현재 모드:{" "}
            <strong>
              {recommendationMode === "commuter"
                ? "직주근접 우선"
                : recommendationMode === "budget"
                  ? "예산 우선"
                  : "가족형 우선"}
            </strong>
          </p>
        </div>
        <div className="mode-chip-group">
          <button
            type="button"
            className={recommendationMode === "commuter" ? "mode-chip active" : "mode-chip"}
            onClick={() => setRecommendationMode("commuter")}
          >
            직주근접 우선
          </button>
          <button
            type="button"
            className={recommendationMode === "budget" ? "mode-chip active" : "mode-chip"}
            onClick={() => setRecommendationMode("budget")}
          >
            예산 우선
          </button>
          <button
            type="button"
            className={recommendationMode === "family" ? "mode-chip active" : "mode-chip"}
            onClick={() => setRecommendationMode("family")}
          >
            가족형 우선
          </button>
        </div>
      </section>

      <section className="content-grid">
        <div className="candidate-grid">
          {filteredCandidates.map((candidate) => (
            <article key={candidate.id} className="candidate-card">
              <div className="candidate-card-header">
                <div>
                  <p className="candidate-district">{candidate.district}</p>
                  <h2>{candidate.name}</h2>
                </div>
                <span className="score-pill">{weightedScore(candidate, recommendationMode)}점</span>
              </div>
              <p className="candidate-summary">{candidate.summary}</p>
              <div className="candidate-meta">
                <span>{candidate.price억}억</span>
                <span>{candidate.size평}평</span>
                <span>{candidate.commute}</span>
              </div>
              <div className="score-strip">
                <div>
                  <span>교통</span>
                  <strong>{candidate.transitScore}</strong>
                </div>
                <div>
                  <span>생활</span>
                  <strong>{candidate.convenienceScore}</strong>
                </div>
                <div>
                  <span>교육</span>
                  <strong>{candidate.educationScore}</strong>
                </div>
                <div>
                  <span>환경</span>
                  <strong>{candidate.environmentScore}</strong>
                </div>
              </div>
              <div className="candidate-actions">
                <button type="button" onClick={() => setFocusedId(candidate.id)}>
                  상세 보기
                </button>
                <button
                  type="button"
                  className={selectedIds.includes(candidate.id) ? "secondary active" : "secondary"}
                  onClick={() => toggleCompare(candidate.id)}
                >
                  {selectedIds.includes(candidate.id) ? "비교 해제" : "비교 추가"}
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="detail-panel">
          <div className="detail-header">
            <div>
              <p className="eyebrow">Focused Candidate</p>
              <h2>{focusedCandidate.name}</h2>
            </div>
            <span className="score-pill dark">{score(focusedCandidate)}점</span>
          </div>
          <p className="detail-summary">{focusedCandidate.summary}</p>
          <div className="detail-grid">
            <div>
              <span>지역</span>
              <strong>{focusedCandidate.district}</strong>
            </div>
            <div>
              <span>매매가</span>
              <strong>{focusedCandidate.price억}억</strong>
            </div>
            <div>
              <span>관리비</span>
              <strong>{focusedCandidate.monthlyFee만}만</strong>
            </div>
            <div>
              <span>출퇴근</span>
              <strong>{focusedCandidate.commute}</strong>
            </div>
            <div>
              <span>생활권 요약</span>
                <strong>{lifestyleSummary(focusedCandidate)}</strong>
              </div>
            <div>
              <span>좌표</span>
              <strong>
                {focusedCandidate.latitude.toFixed(3)}, {focusedCandidate.longitude.toFixed(3)}
              </strong>
            </div>
          </div>
          <div className="recommendation-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Recommendation</p>
                <h2>왜 이 후보를 볼 만한가</h2>
              </div>
            </div>
            <div className="recommendation-grid">
              <article className="recommendation-card">
                <span>생활권 적합도</span>
                <strong>{focusedScoreProfile.housingFit}점</strong>
                <p>교통, 생활 편의, 주거 환경을 묶어 본 생활권 중심 점수</p>
              </article>
              <article className="recommendation-card">
                <span>예산 적합도</span>
                <strong>{focusedScoreProfile.costFit}점</strong>
                <p>현재 설정한 예산 안에서 부담이 어느 정도인지 반영한 점수</p>
              </article>
              <article className="recommendation-card">
                <span>가족형 적합도</span>
                <strong>{focusedScoreProfile.familyFit}점</strong>
                <p>교육, 환경, 생활 편의 기준으로 본 장기 거주 관점 점수</p>
              </article>
            </div>
            <div className="reason-box">
              <h3>추천 이유</h3>
              <ul>
                {focusedReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lifestyle-map-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Lifestyle Map</p>
                <h2>실제 생활권 지도</h2>
              </div>
            </div>
            <div className="map-shell">
              <MapContainer
                center={[focusedCandidate.latitude, focusedCandidate.longitude]}
                zoom={12}
                scrollWheelZoom={false}
                className="leaflet-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapViewport
                  latitude={focusedCandidate.latitude}
                  longitude={focusedCandidate.longitude}
                />
                {filteredCandidates.map((candidate) => {
                  const isFocused = candidate.id === focusedCandidate.id;
                  const isCompared = selectedIds.includes(candidate.id);
                  return (
                    <CircleMarker
                      key={candidate.id}
                      center={[candidate.latitude, candidate.longitude]}
                      radius={isFocused ? 14 : isCompared ? 10 : 8}
                      pathOptions={{
                        color: isFocused ? "#9a3412" : isCompared ? "#2563eb" : "#475569",
                        fillColor: isFocused ? "#fb923c" : isCompared ? "#60a5fa" : "#cbd5e1",
                        fillOpacity: 0.9,
                        weight: isFocused ? 3 : 2
                      }}
                      eventHandlers={{
                        click: () => setFocusedId(candidate.id)
                      }}
                    >
                      <Popup>
                        <strong>{candidate.name}</strong>
                        <br />
                        {candidate.district}
                        <br />
                        {candidate.price억}억 · {candidate.commute}
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
            <div className="highlight-list">
              {focusedCandidate.nearbyHighlights.map((highlight) => (
                <article key={highlight.label} className="highlight-card">
                  <span>{highlight.label}</span>
                  <strong>도보 {highlight.distanceMinutes}분</strong>
                </article>
              ))}
            </div>
            <div className="map-caption-grid">
              <article className="map-caption-card">
                <span>선택 후보</span>
                <strong>{focusedCandidate.name}</strong>
                <p>{scoreBreakdown(focusedCandidate, recommendationMode)}</p>
              </article>
              <article className="map-caption-card">
                <span>지도 탐색 힌트</span>
                <strong>비교 후보도 함께 표시</strong>
                <p>주황색은 현재 선택 후보, 파란색은 비교 중인 후보를 의미한다.</p>
              </article>
            </div>
          </div>
          <div className="point-box">
            <h3>장점</h3>
            <ul>
              {focusedCandidate.strengths.map((strength) => (
                <li key={strength}>{strength}</li>
              ))}
            </ul>
          </div>
          <div className="point-box caution">
            <h3>주의할 점</h3>
            <ul>
              {focusedCandidate.cautions.map((caution) => (
                <li key={caution}>{caution}</li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="insight-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Decision Lens</p>
            <h2>생활권 관점 빠른 판단</h2>
          </div>
          <p>필터 결과 안에서 어떤 후보가 어떤 기준에 강한지 빠르게 비교한다.</p>
        </div>
        <div className="insight-grid">
          <article className="insight-card">
            <span>교통 최상위</span>
            <strong>
              {[...filteredCandidates].sort((a, b) => b.transitScore - a.transitScore)[0]?.name ?? "-"}
            </strong>
            <p>출퇴근과 직주근접이 가장 강한 후보</p>
          </article>
          <article className="insight-card">
            <span>환경 최상위</span>
            <strong>
              {[...filteredCandidates].sort((a, b) => b.environmentScore - a.environmentScore)[0]?.name ?? "-"}
            </strong>
            <p>쾌적성과 공원 접근성이 가장 좋은 후보</p>
          </article>
          <article className="insight-card">
            <span>가성비 최상위</span>
            <strong>
              {[...filteredCandidates].sort((a, b) => a.price억 - b.price억)[0]?.name ?? "-"}
            </strong>
            <p>예산 압박이 가장 적은 후보</p>
          </article>
          <article className="insight-card">
            <span>가족형 추천</span>
            <strong>
              {[...filteredCandidates].sort((a, b) => scoreProfile(b, budget, recommendationMode).familyFit - scoreProfile(a, budget, recommendationMode).familyFit)[0]?.name ?? "-"}
            </strong>
            <p>교육과 쾌적성을 함께 보면 우선 검토할 후보</p>
          </article>
          <article className="insight-card">
            <span>현재 모드 추천</span>
            <strong>
              {[...filteredCandidates].sort((a, b) => weightedScore(b, recommendationMode) - weightedScore(a, recommendationMode))[0]?.name ?? "-"}
            </strong>
            <p>
              {recommendationMode === "commuter"
                ? "직주근접 기준에서 가장 먼저 볼 후보"
                : recommendationMode === "budget"
                  ? "예산 효율 기준에서 가장 먼저 볼 후보"
                  : "가족형 기준에서 가장 먼저 볼 후보"}
            </p>
          </article>
        </div>
      </section>

      <section className="compare-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Compare</p>
            <h2>선택한 후보 비교</h2>
          </div>
          <p>최대 3개까지 비교할 수 있다.</p>
        </div>
        <div className="compare-table">
          <div className="compare-row header">
            <span>항목</span>
            {comparedCandidates.map((candidate) => (
              <strong key={candidate.id}>{candidate.name}</strong>
            ))}
          </div>
          {compareRows.map(({ label, formatter }) => (
            <div key={label} className="compare-row">
              <span>{label}</span>
              {comparedCandidates.map((candidate) => (
                <p key={`${candidate.id}-${label}`}>{formatter(candidate)}</p>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
