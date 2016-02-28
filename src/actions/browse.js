import { arrayOf, normalize } from 'normalizr';
import { CLIENT_ID } from '../constants/authentification';
import { trackSchema } from '../constants/schemas';
import * as actionTypes from '../constants/actionTypes';
import * as requestTypes from '../constants/requestTypes';
import { unauthApiUrl } from '../utils/soundcloudApi';
import { setRequestInProcess } from '../actions/request';
import { setPaginateLink } from '../actions/paginate';
import { mergeEntities } from '../actions/entities';

function mergeActivitiesByGenre(activities, genre) {
  return {
    type: actionTypes.MERGE_GENRE_ACTIVITIES,
    activities,
    genre
  };
}

export function fetchActivitiesByGenre(nextHref, genre) {
  return (dispatch, getState) => {

    let requestType = requestTypes.GENRES;
    let initHref = unauthApiUrl(`tracks?linked_partitioning=1&limit=20&offset=0&tags=${genre}`, '&');
    let url = nextHref || initHref;
    let requestInProcess = getState().request[requestType];

    if (requestInProcess) { return; }

    dispatch(setRequestInProcess(true, requestType));

    return fetch(url)
      .then(response => response.json())
      .then(data => {
        const normalized = normalize(data.collection, arrayOf(trackSchema));
        dispatch(mergeEntities(normalized.entities));
        dispatch(mergeActivitiesByGenre(normalized.result, genre));
        dispatch(setPaginateLink(data.next_href, genre));
        dispatch(setRequestInProcess(false, requestType));
      });
  };
}