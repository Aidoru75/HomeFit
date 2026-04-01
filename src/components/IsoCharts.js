// Isometric 3D bar chart primitives built on react-native-svg
// IsoBarChart  — vertical bars (Calories tab)
// IsoStackedBar — horizontal stacked bar (Workload tab)
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Svg, Polygon, Line, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { fonts } from '../theme';

const COS30 = 0.866;
const SIN30 = 0.5;

const MAX_BAR_W    = 32;  // cap on bar width when few bars
const MIN_SLOT     = 10;  // minimum slot before scrolling kicks in
const BAR_SPACING  = 2;   // gap between front faces — right face peeks through above
const NO_SECTIONS  = 4;   // number of y-axis grid divisions
const Y_AXIS_W     = 36;  // width reserved for y-axis labels

// Blend hex color toward white (factor > 0) or black (factor < 0)
function shadeColor(hex, factor) {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const blend = c => factor > 0
    ? Math.round(c + (255 - c) * factor)
    : Math.round(c + c * factor);
  return `rgb(${blend(r)},${blend(g)},${blend(b)})`;
}

// Format y-axis label: 1234 → "1.2k", 12345 → "12k"
function fmtVal(v) {
  if (v >= 10000) return `${Math.round(v / 1000)}k`;
  if (v >= 1000)  return `${(v / 1000).toFixed(1)}k`;
  return Math.round(v).toString();
}

// Format (x,y) pairs into SVG points string, rounded to 1dp
function pts(...pairs) {
  return pairs.map(([x, y]) =>
    `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`
  ).join(' ');
}

// ─── Vertical bar chart ───────────────────────────────────────────────────────

export function IsoBarChart({ data, chartHeight = 180, depth = 10, maxValue }) {
  const [chartAreaWidth, setChartAreaWidth] = useState(0);

  if (!data || data.length === 0) return null;

  const dx = depth * COS30;
  const dy = depth * SIN30;
  const svgHeight = chartHeight + dy + 4;
  const baseline  = chartHeight + dy + 2;

  const resolvedMax = maxValue || Math.max(...data.map(d => d.value), 1);

  const naturalSlot = chartAreaWidth > 0 ? (chartAreaWidth - dx) / data.length : 0;
  const needsScroll = naturalSlot < MIN_SLOT;
  const slot        = needsScroll ? MIN_SLOT : naturalSlot;
  const barW        = Math.min(slot - BAR_SPACING, MAX_BAR_W);
  const totalSvgW   = data.length * slot + dx + 4;
  const chartW      = needsScroll ? totalSvgW : chartAreaWidth;

  // ── Y-axis (fixed, outside scroll) ──────────────────────────────────────
  const yAxis = (
    <Svg width={Y_AXIS_W} height={svgHeight}>
      {Array.from({ length: NO_SECTIONS + 1 }, (_, k) => {
        const y   = baseline - k * (chartHeight / NO_SECTIONS);
        const val = (k / NO_SECTIONS) * resolvedMax;
        return (
          <SvgText key={k}
            x={Y_AXIS_W - 4}
            y={k === NO_SECTIONS ? y + 4 : y - 4}
            textAnchor="end"
            fontSize={9}
            fontFamily={fonts.regular}
            fill="#aaaaaa"
          >
            {fmtVal(val)}
          </SvgText>
        );
      })}
    </Svg>
  );

  // ── Chart SVG (scrollable when needed) ──────────────────────────────────
  const chartSvg = chartAreaWidth > 0 ? (
    <Svg width={chartW} height={svgHeight}>
      <Defs>
        {data.map((item, i) => (
          <React.Fragment key={i}>
            <LinearGradient id={`fg${i}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={shadeColor(item.color, 0.45)} />
              <Stop offset="1" stopColor={shadeColor(item.color, -0.10)} />
            </LinearGradient>
            <LinearGradient id={`rg${i}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={shadeColor(item.color, -0.20)} />
              <Stop offset="1" stopColor={shadeColor(item.color, -0.45)} />
            </LinearGradient>
          </React.Fragment>
        ))}
      </Defs>

      {/* Grid lines (drawn first — behind bars) */}
      {Array.from({ length: NO_SECTIONS + 1 }, (_, k) => {
        const y = baseline - k * (chartHeight / NO_SECTIONS);
        return (
          <Line key={`g${k}`}
            x1={0} y1={y} x2={chartW - dx} y2={y}
            stroke={k === 0 ? '#cccccc' : '#ebebeb'}
            strokeWidth={k === 0 ? 1 : 0.5}
          />
        );
      })}

      {/* Right faces — drawn first so front faces overlap them */}
      {data.map((item, i) => {
        const barX = i * slot + BAR_SPACING / 2;
        const barH = Math.max((item.value / resolvedMax) * chartHeight, 1);
        const top  = baseline - barH;
        return (
          <Polygon key={`r${i}`}
            points={pts(
              [barX + barW, top],            [barX + barW + dx, top - dy],
              [barX + barW + dx, baseline - dy], [barX + barW, baseline]
            )}
            fill={`url(#rg${i})`}
            onPress={item.onPress}
          />
        );
      })}

      {/* Front + top faces */}
      {data.map((item, i) => {
        const barX = i * slot + BAR_SPACING / 2;
        const barH = Math.max((item.value / resolvedMax) * chartHeight, 1);
        const top  = baseline - barH;
        return (
          <React.Fragment key={`ft${i}`}>
            <Polygon
              points={pts(
                [barX, top], [barX + barW, top],
                [barX + barW, baseline], [barX, baseline]
              )}
              fill={`url(#fg${i})`}
              onPress={item.onPress}
            />
            <Polygon
              points={pts(
                [barX, top], [barX + barW, top],
                [barX + barW + dx, top - dy], [barX + dx, top - dy]
              )}
              fill={shadeColor(item.color, 0.35)}
              onPress={item.onPress}
            />
          </React.Fragment>
        );
      })}
    </Svg>
  ) : null;

  return (
    <View style={{ flexDirection: 'row' }}>
      {yAxis}
      <View style={{ flex: 1 }} onLayout={e => setChartAreaWidth(e.nativeEvent.layout.width)}>
        {needsScroll
          ? <ScrollView horizontal showsHorizontalScrollIndicator={false}>{chartSvg}</ScrollView>
          : chartSvg
        }
      </View>
    </View>
  );
}

// ─── Horizontal stacked bar ───────────────────────────────────────────────────

export function IsoStackedBar({ segments, barHeight = 20, depth = 8 }) {
  const [containerWidth, setContainerWidth] = useState(0);

  if (!segments || segments.length === 0) return null;

  const dx = depth * COS30;
  const dy = depth * SIN30;
  const svgHeight = barHeight + dy + 2;
  const barTop    = dy + 1;
  const barBottom = barTop + barHeight;
  const totalWidth = containerWidth > 0 ? containerWidth - dx : 0;

  let cumX = 0;
  const rects = segments.map(seg => {
    const w = (seg.pct / 100) * totalWidth;
    const x = cumX;
    cumX += w;
    return { color: seg.color, x, w };
  });

  const last = rects[rects.length - 1];

  return (
    <View onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
      {containerWidth > 0 && (
        <Svg width={containerWidth} height={svgHeight}>
          <Defs>
            {rects.map((r, i) => (
              <LinearGradient key={i} id={`sfg${i}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={shadeColor(r.color, 0.40)} />
                <Stop offset="1" stopColor={shadeColor(r.color, -0.10)} />
              </LinearGradient>
            ))}
          </Defs>

          {/* Front faces */}
          {rects.map((r, i) => (
            <Polygon key={`f${i}`}
              points={pts(
                [r.x, barTop], [r.x + r.w, barTop],
                [r.x + r.w, barBottom], [r.x, barBottom]
              )}
              fill={`url(#sfg${i})`}
            />
          ))}
          {/* Top faces */}
          {rects.map((r, i) => (
            <Polygon key={`t${i}`}
              points={pts(
                [r.x, barTop], [r.x + r.w, barTop],
                [r.x + r.w + dx, barTop - dy], [r.x + dx, barTop - dy]
              )}
              fill={shadeColor(r.color, 0.35)}
            />
          ))}
          {/* Right face on last segment only */}
          {last && (
            <Polygon
              points={pts(
                [last.x + last.w, barTop],
                [last.x + last.w + dx, barTop - dy],
                [last.x + last.w + dx, barBottom - dy],
                [last.x + last.w, barBottom]
              )}
              fill={shadeColor(last.color, -0.30)}
            />
          )}
        </Svg>
      )}
    </View>
  );
}

// ─── Single horizontal 3D bar (Workload volume rows) ─────────────────────────

export function IsoHBar({ id, pct, color, barHeight = 16, depth = 6, targetPct }) {
  const [containerWidth, setContainerWidth] = useState(0);

  const dx = depth * COS30;
  const dy = depth * SIN30;
  const svgHeight = barHeight + dy + 2;
  const barTop    = dy + 1;
  const barBottom = barTop + barHeight;
  const trackW    = containerWidth > 0 ? containerWidth - dx : 0;
  const barW      = pct > 0 ? Math.max((pct / 100) * trackW, 2) : 0;

  const gradId    = `hfg_${id}`;

  return (
    <View onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
      {containerWidth > 0 && (
        <Svg width={containerWidth} height={svgHeight}>
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={shadeColor(color, 0.40)} />
              <Stop offset="1" stopColor={shadeColor(color, -0.10)} />
            </LinearGradient>
          </Defs>

          {/* Background track — shifted up by dy to sit behind depth area */}
          <Polygon
            points={pts([0, 1], [trackW, 1], [trackW, 1 + barHeight], [0, 1 + barHeight])}
            fill="#f0f0f0"
          />

          {barW > 0 && (
            <>
              {/* Right face */}
              <Polygon
                points={pts(
                  [barW, barTop], [barW + dx, barTop - dy],
                  [barW + dx, barBottom - dy], [barW, barBottom]
                )}
                fill={shadeColor(color, -0.30)}
              />
              {/* Front face */}
              <Polygon
                points={pts([0, barTop], [barW, barTop], [barW, barBottom], [0, barBottom])}
                fill={`url(#${gradId})`}
              />
              {/* Top face */}
              <Polygon
                points={pts([0, barTop], [barW, barTop], [barW + dx, barTop - dy], [dx, barTop - dy])}
                fill={shadeColor(color, 0.35)}
              />
            </>
          )}

          {/* Balance marker — 3D block, right face only when volume is below target */}
          {targetPct > 0 && (() => {
            const mX        = (targetPct / 100) * trackW;
            const mW        = 3;
            const showRight = pct < targetPct;
            const bX = mX - mW;
            return (
              <>
                {showRight && (
                  <Polygon
                    points={pts(
                      [bX + mW, barTop], [bX + mW + dx, barTop - dy],
                      [bX + mW + dx, barBottom - dy], [bX + mW, barBottom]
                    )}
                    fill="black" fillOpacity={0.21}
                  />
                )}
                <Polygon
                  points={pts([bX, barTop], [bX + mW, barTop], [bX + mW, barBottom], [bX, barBottom])}
                  fill="black" fillOpacity={0.42}
                />
                <Polygon
                  points={pts([bX, barTop], [bX + mW, barTop], [bX + mW + dx, barTop - dy], [bX + dx, barTop - dy])}
                  fill="black" fillOpacity={0.28}
                />
              </>
            );
          })()}
        </Svg>
      )}
    </View>
  );
}
