import styled from "@emotion/styled"
import { Add } from "@mui/icons-material"
import { ListItemIcon } from "@mui/material"
import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import { addTrack } from "../../actions"
import { useStores } from "../../hooks/useStores"

const Wrapper = styled.div`
  display: flex;
  padding: 0.5rem 1rem;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.secondaryTextColor};
  border-radius: 0.5rem;
  margin: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.highlightColor};
  }
`

const AddTrackListIcon = styled(ListItemIcon)`
  min-width: auto;
  margin-right: 0.6em;
  color: inherit;
`

const Label = styled.div`
  font-size: 0.875rem;
`

export const AddTrackButton: FC = observer(() => {
  const rootStore = useStores()

  const onClickAddTrack = useCallback(() => addTrack(rootStore)(), [])

  return (
    <Wrapper onClick={onClickAddTrack}>
      <AddTrackListIcon>
        <Add />
      </AddTrackListIcon>
      <Label>{localized("add-track", "Add track")}</Label>
    </Wrapper>
  )
})
