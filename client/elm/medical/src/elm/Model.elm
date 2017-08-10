module Model
    exposing
        ( initialModel
        , Model
        , Page(..)
        , PageState(..)
        )

import Dict exposing (Dict)
import Window


-- LOCAL IMPORTS --

import Data.Patient exposing (PatientRecord)
import Data.Pregnancy exposing (getPregId, PregnancyRecord, PregnancyId(..))
import Data.Session as Session exposing (Session)
import Data.SiteMessage exposing (SiteKeyValue(..))
import Page.Errored as Errored exposing (PageLoadError, view)
import Page.LaborDelIpp as PageLaborDelIpp
import Processing exposing (ProcessStore)


type Page
    = Blank
    | NotFound
    | Errored PageLoadError
    | LaborDelIpp PageLaborDelIpp.Model


type PageState
    = Loaded Page
    | TransitioningFrom Page


type alias Model =
    { currPregId : Maybe PregnancyId
    , pageState : PageState
    , session : Session
    , processStore : ProcessStore
    , window : Maybe Window.Size
    , siteMessages : Dict String SiteKeyValue
    , patientRecord : Maybe PatientRecord
    , pregnancyRecord : Maybe PregnancyRecord
    }


initialModel : Maybe PregnancyId -> Model
initialModel pregId =
    { currPregId = pregId
    , pageState = Loaded <| initialPage pregId
    , session = { user = Nothing }
    , processStore = Processing.processStoreInit
    , window = Nothing
    , siteMessages = Dict.empty
    , patientRecord = Nothing
    , pregnancyRecord = Nothing
    }


initialPage : Maybe PregnancyId -> Page
initialPage pregId =
    case pregId of
        Just pid ->
            LaborDelIpp { pregnancy_id = pid }

        Nothing ->
            Blank
