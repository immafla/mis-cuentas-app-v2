import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Button,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import React, { useState } from "react";

type DailyGoalCardProps = {
  glassCardSx: SxProps<Theme>;
  isExpanded: boolean;
  onToggle: () => void;
  dailySalesGoal: number;
  goalProgress: number;
  isSaving: boolean;
  onSaveDailyGoal: (nextDailySalesGoal: number) => Promise<{ success: boolean; message: string }>;
};

export const DailyGoalCard = React.forwardRef<HTMLDivElement, DailyGoalCardProps>(
  (
    { glassCardSx, isExpanded, onToggle, dailySalesGoal, goalProgress, isSaving, onSaveDailyGoal },
    ref,
  ) => {
    const [goalInputValue, setGoalInputValue] = useState(String(dailySalesGoal || 0));
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [isEditingGoal, setIsEditingGoal] = useState(false);

    const handleSave = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setFeedbackMessage(null);

      const nextGoal = Math.max(0, Math.floor(Number(goalInputValue) || 0));
      const { success, message } = await onSaveDailyGoal(nextGoal);

      setFeedbackMessage(message);

      if (success) {
        setGoalInputValue(String(nextGoal));
        setIsEditingGoal(false);
      }
    };

    const handleStartEditing = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setFeedbackMessage(null);
      setGoalInputValue(String(Math.max(0, Math.floor(Number(dailySalesGoal) || 0))));
      setIsEditingGoal(true);
    };

    return (
      <Paper ref={ref} elevation={0} sx={glassCardSx} onClick={onToggle}>
        <Stack spacing={isExpanded ? 2 : 0}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ minHeight: { xs: 38, sm: 42 } }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Meta diaria
            </Typography>
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onToggle();
              }}
              sx={{
                transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform .2s ease",
              }}
            >
              <ExpandMoreRoundedIcon />
            </IconButton>
          </Stack>
          <Collapse in={isExpanded} unmountOnExit>
            <Stack spacing={2}>
              <Typography color="text.secondary">
                {Number(dailySalesGoal ?? 0).toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={goalProgress}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="text.secondary">
                {`${goalProgress}% completado`}
              </Typography>
              {isEditingGoal ? (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  onClick={(event) => event.stopPropagation()}
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Meta diaria"
                    inputProps={{ min: 0, step: 1000 }}
                    value={goalInputValue}
                    onChange={(event) => setGoalInputValue(event.target.value)}
                    onClick={(event) => event.stopPropagation()}
                  />
                  <Button variant="contained" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
                </Stack>
              ) : (
                <Button
                  variant="outlined"
                  onClick={handleStartEditing}
                  sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
                >
                  Editar meta
                </Button>
              )}
              {feedbackMessage && (
                <Typography variant="caption" color="text.secondary">
                  {feedbackMessage}
                </Typography>
              )}
            </Stack>
          </Collapse>
        </Stack>
      </Paper>
    );
  },
);

DailyGoalCard.displayName = "DailyGoalCard";
