module Msg
    exposing
        ( Msg(..)
        , ProcessType(..)
        , logError
        , logInfo
        , logWarning
        , toastError
        , toastInfo
        , toastWarn
        )

-- LOCAL IMPORTS --

import Data.Admitting as Admitting
import Data.Baby exposing (BabyRecord, BabyRecordNew)
import Data.BabyLab exposing (BabyLabRecord, BabyLabRecordNew)
import Data.BabyMedication exposing (BabyMedicationRecord, BabyMedicationRecordNew)
import Data.BabyVaccination exposing (BabyVaccinationRecord, BabyVaccinationRecordNew)
import Data.BirthCert
import Data.BirthCertificate exposing (BirthCertificateRecord, BirthCertificateRecordNew)
import Data.ContPP as ContPP
import Data.ContPostpartumCheck
    exposing
        ( ContPostpartumCheckRecord
        , ContPostpartumCheckRecordNew
        )
import Data.DatePicker exposing (DateField, DateFieldMessage)
import Data.Discharge exposing (DischargeRecord, DischargeRecordNew)
import Data.Labor exposing (LaborId, LaborRecord, LaborRecordNew)
import Data.LaborDelIpp as LaborDelIpp
import Data.LaborStage1 exposing (LaborStage1Record, LaborStage1RecordNew)
import Data.LaborStage2 exposing (LaborStage2Record, LaborStage2RecordNew)
import Data.LaborStage3 exposing (LaborStage3Record, LaborStage3RecordNew)
import Data.Log exposing (Severity(..))
import Data.Membrane exposing (MembraneRecord, MembraneRecordNew)
import Data.Message as Message exposing (IncomingMessage(..), MsgType)
import Data.MotherMedication exposing (MotherMedicationRecord, MotherMedicationRecordNew)
import Data.NewbornExam exposing (NewbornExamRecord, NewbornExamRecordNew)
import Data.Postpartum as Postpartum
import Data.PostpartumCheck exposing (PostpartumCheckRecord, PostpartumCheckRecordNew)
import Data.Pregnancy exposing (PregnancyId)
import Data.Processing exposing (ProcessId)
import Data.SelectQuery exposing (SelectQuery)
import Data.Table exposing (Table)
import Data.TableRecord exposing (..)
import Data.Toast exposing (ToastType(..))
import Json.Encode as JE
import Route exposing (Route)
import Task
import Time exposing (Time)
import Window


type Msg
    = Noop
    | AdmittingLoaded PregnancyId
    | AdmittingMsg Admitting.AdmittingSubMsg
    | AdmittingSelectQuery Table (Maybe Int) (List Table)
    | BirthCertLoaded PregnancyId LaborRecord
    | BirthCertMsg Data.BirthCert.SubMsg
    | BirthCertSelectQuery Table (Maybe Int) (List Table)
    | ContPPLoaded PregnancyId LaborRecord
    | ContPPMsg ContPP.SubMsg
    | ContPPSelectQuery Table (Maybe Int) (List Table)
    | IncomingDatePicker DateFieldMessage
    | LaborDelIppLoaded PregnancyId
    | LaborDelIppMsg LaborDelIpp.SubMsg
    | LaborDelIppSelectQuery Table (Maybe Int) (List Table)
    | Log Severity String
    | Message IncomingMessage
    | OpenDatePicker String
    | PostpartumLoaded PregnancyId LaborRecord
    | PostpartumMsg Postpartum.SubMsg
    | PostpartumSelectQuery Table (Maybe Int) (List Table)
    | ProcessTypeMsg ProcessType MsgType JE.Value
    | SetDialogActive Bool
    | SetRoute (Maybe Route)
    | Tick Time
    | Toast (List String) Int ToastType
    | WindowResize (Maybe Window.Size)


{-| Initiate a Cmd to send a message to the console. This function
is located here to address circular dependencies.
-}
logInfo : String -> Cmd Msg
logInfo msg =
    Task.perform (Log InfoSeverity) (Task.succeed msg)


logWarning : String -> Cmd Msg
logWarning msg =
    Task.perform (Log WarningSeverity) (Task.succeed msg)


logError : String -> Cmd Msg
logError msg =
    Task.perform (Log ErrorSeverity) (Task.succeed msg)


{-| Initiate a Cmd to send an informational message to the user
via a toast. This function is located here to address circular
dependencies.
-}
toastInfo : List String -> Int -> Cmd Msg
toastInfo msgs seconds =
    Task.perform (Toast msgs seconds) (Task.succeed InfoToast)


{-| Initiate a Cmd to send an warning message to the user
via a toast. This function is located here to address circular
dependencies.
-}
toastWarn : List String -> Int -> Cmd Msg
toastWarn msgs seconds =
    Task.perform (Toast msgs seconds) (Task.succeed WarningToast)


{-| Initiate a Cmd to send an error message to the user
via a toast. This function is located here to address circular
dependencies.
-}
toastError : List String -> Int -> Cmd Msg
toastError msgs seconds =
    Task.perform (Toast msgs seconds) (Task.succeed ErrorToast)


{-| The data that is stored in the process store. This temporary
data store is used as the bridge over the asyncronous divide
between making a websocket request and receiving the response
from the server. It is used for all CRUD with the server because
we are not assuming optimistic changes, therefore we need a means
to "remember" what we should do when the server responds positively.
-}
type ProcessType
    = AddBabyType Msg BabyRecordNew
    | AddBabyLabType Msg BabyLabRecordNew
    | AddBabyMedicationType Msg BabyMedicationRecordNew
    | AddBabyVaccinationType Msg BabyVaccinationRecordNew
    | AddBirthCertificateType Msg BirthCertificateRecordNew
    | AddContPostpartumCheckType Msg ContPostpartumCheckRecordNew
    | AddDischargeType Msg DischargeRecordNew
    | AddLaborType Msg LaborRecordNew
    | AddLaborStage1Type Msg LaborStage1RecordNew
    | AddLaborStage2Type Msg LaborStage2RecordNew
    | AddLaborStage3Type Msg LaborStage3RecordNew
    | AddMembraneType Msg MembraneRecordNew
    | AddMotherMedicationType Msg MotherMedicationRecordNew
    | AddNewbornExamType Msg NewbornExamRecordNew
    | AddPostpartumCheckType Msg PostpartumCheckRecordNew
    | DelBabyMedicationType Msg Int
    | DelBabyVaccinationType Msg Int
    | DelBabyLabType Msg Int
    | DelMotherMedicationType Msg Int
    | UpdateBabyType Msg BabyRecord
    | UpdateBabyLabType Msg BabyLabRecord
    | UpdateBabyMedicationType Msg BabyMedicationRecord
    | UpdateBabyVaccinationType Msg BabyVaccinationRecord
    | UpdateBirthCertificateType Msg BirthCertificateRecord
    | UpdateContPostpartumCheckType Msg ContPostpartumCheckRecord
    | UpdateDischargeType Msg DischargeRecord
    | UpdateLaborType Msg LaborRecord
    | UpdateLaborStage1Type Msg LaborStage1Record
    | UpdateLaborStage2Type Msg LaborStage2Record
    | UpdateLaborStage3Type Msg LaborStage3Record
    | UpdateMembraneType Msg MembraneRecord
    | UpdateMotherMedicationType Msg MotherMedicationRecord
    | UpdateNewbornExamType Msg NewbornExamRecord
    | UpdatePostpartumCheckType Msg PostpartumCheckRecord
    | SelectQueryType Msg SelectQuery
