import React from 'react';
import { TvBoard1 } from './tv-boards/TvBoard1';
import { TvBoard2 } from './tv-boards/TvBoard2';
import { TvBoard3 } from './tv-boards/TvBoard3';
import { TvBoard4 } from './tv-boards/TvBoard4';

interface TvBoardsContainerProps {
  tvBoardsConfig: Record<number, any>;
  tvVariant: number;
  setTvVariant: (n: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  IS_MINI_PREVIEW: boolean;
  tvPreview: any;
  tvPreviewBoard: () => number | null;
  // TV board specific props
  tvRotationDeg?: number;
  tvPanelHidden?: boolean;
  tvUpcomingTenPatients?: any;
  tvTenStartIndex?: number;
  tvTenText?: string;
  tvTokenStyle?: any;
  tvNameStyle?: any;
  queueTokenInfo?: any;
  getTvProjectedCallClock?: () => void;
  tvInsidePatients?: any;
  tvPanelFlex?: boolean;
  tvAbsentPatients?: any;
  tvCount?: (n: number) => number;
  handleRotateTvDisplay?: () => void;
  handleResetTvDisplayRotation?: () => void;
  // State props for each board
  board1Props?: any;
  board2Props?: any;
  board3Props?: any;
  board4Props?: any;
}

export const TvBoardsContainer: React.FC<TvBoardsContainerProps> = ({
  tvBoardsConfig,
  tvVariant,
  setTvVariant,
  activeTab,
  setActiveTab,
  IS_MINI_PREVIEW,
  tvPreview,
  tvPreviewBoard,
  tvRotationDeg,
  tvPanelHidden,
  tvUpcomingTenPatients,
  tvTenStartIndex,
  tvTenText,
  tvTokenStyle,
  tvNameStyle,
  queueTokenInfo,
  getTvProjectedCallClock,
  tvInsidePatients,
  tvPanelFlex,
  tvAbsentPatients,
  tvCount,
  handleRotateTvDisplay,
  handleResetTvDisplayRotation,
  board1Props,
  board2Props,
  board3Props,
  board4Props,
}) => {
  // Determine which board to show based on variant
  const BoardComponent = tvVariant === 1 ? TvBoard1 : tvVariant === 2 ? TvBoard2 : tvVariant === 3 ? TvBoard3 : TvBoard4;

  // Determine props based on which board is active
  const boardProps = tvVariant === 1 ? board1Props : tvVariant === 2 ? board2Props : tvVariant === 3 ? board3Props : board4Props;

  if (IS_MINI_PREVIEW) {
    // In mini preview mode, just show the board label
    return (
      <div className="p-4 text-sm text-slate-400">
        {tvBoardsConfig[tvVariant]?.label || `TV-${tvVariant}`}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BoardComponent
        tvRotationDeg={tvRotationDeg}
        tvPanelHidden={tvPanelHidden}
        tvUpcomingTenPatients={tvUpcomingTenPatients}
        tvTenStartIndex={tvTenStartIndex}
        tvTenText={tvTenText}
        tvTokenStyle={tvTokenStyle}
        tvNameStyle={tvNameStyle}
        queueTokenInfo={queueTokenInfo}
        getTvProjectedCallClock={getTvProjectedCallClock}
        tvInsidePatients={tvInsidePatients}
        tvPanelFlex={tvPanelFlex}
        tvAbsentPatients={tvAbsentPatients}
        tvCount={tvCount}
        handleRotateTvDisplay={handleRotateTvDisplay}
        handleResetTvDisplayRotation={handleResetTvDisplayRotation}
        {...boardProps}
      />
    </div>
  );
};