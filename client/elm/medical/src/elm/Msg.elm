module Msg
    exposing
        ( Msg(..)
        , ProcessType(..)
        )

import Window

-- LOCAL IMPORTS --

import Data.LaborDelIpp as LaborDelIpp
import Data.Message as Message exposing (IncomingMessage(..))
import Data.Processing exposing (ProcessId)
import Data.SelectQuery exposing (SelectQuery)
import Data.TableRecord exposing (..)
import Route exposing (Route)


type Msg
    = Noop
    | LogConsole String
    | WindowResize (Maybe Window.Size)
    | SetRoute (Maybe Route)
    | LaborDelIppLoaded
    | LaborDelIppMsg LaborDelIpp.InternalMsg
    | Message IncomingMessage


{-| The data that is stored in the process store. This is used as
the bridge over the asyncronous divide between making a websocket
request and receiving the response from the server.
-}
type ProcessType
    = SelectQueryType Msg SelectQuery

