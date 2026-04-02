import { useMemo, useState } from "react";
import { apartments } from "./data/apartments";
import type { ApartmentCandidate, CommuteLevel } from "./types";

type SortOption = "balance" | "price" | "transit" | "education";

function score(candidate: ApartmentCandidate): number {
  return Math.round(
    candidate.transitScore * 0.3 +
      candidate.convenienceScore * 0.25 +
      candidate.educationScore * 0.2 +
      candidate.environmentScore * 0.25
  );
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

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("전체");
  const [budget, setBudget] = useState(18);
  const [maxCommute, setMaxCommute] = useState<CommuteLevel>("대중교통 45분");
  const [sortOption, setSortOption] = useState<SortOption>("balance");
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

        return score(right) - score(left);
      });
  }, [budget, keyword, maxCommute, selectedDistrict, sortOption]);

  const focusedCandidate =
    apartments.find((candidate) => candidate.id === focusedId) ?? filteredCandidates[0] ?? apartments[0];

  const comparedCandidates = selectedIds
    .map((id) => apartments.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is ApartmentCandidate => candidate != null);

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

      <section className="content-grid">
        <div className="candidate-grid">
          {filteredCandidates.map((candidate) => (
            <article key={candidate.id} className="candidate-card">
              <div className="candidate-card-header">
                <div>
                  <p className="candidate-district">{candidate.district}</p>
                  <h2>{candidate.name}</h2>
                </div>
                <span className="score-pill">{score(candidate)}점</span>
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
          <div className="lifestyle-map-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Lifestyle Map</p>
                <h2>생활권 요약 맵</h2>
              </div>
            </div>
            <div className="mock-map">
              <div className="mock-map-grid" />
              <div
                className="map-pin home"
                style={{
                  left: `${35 + (focusedCandidate.transitScore - 60) * 0.7}%`,
                  top: `${65 - (focusedCandidate.environmentScore - 60) * 0.5}%`
                }}
              >
                <span>{focusedCandidate.name}</span>
              </div>
              {focusedCandidate.nearbyHighlights.map((highlight, index) => (
                <div
                  key={highlight.label}
                  className="map-pin poi"
                  style={{
                    left: `${18 + index * 24}%`,
                    top: `${22 + (index % 2) * 28}%`
                  }}
                >
                  <span>{highlight.label}</span>
                </div>
              ))}
            </div>
            <div className="highlight-list">
              {focusedCandidate.nearbyHighlights.map((highlight) => (
                <article key={highlight.label} className="highlight-card">
                  <span>{highlight.label}</span>
                  <strong>도보 {highlight.distanceMinutes}분</strong>
                </article>
              ))}
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
