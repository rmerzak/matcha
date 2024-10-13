import datetime

import authentik_client as ac
from authentik_client.models.flow import Flow
from authentik_client.models.flow_designation_enum import FlowDesignationEnum
from authentik_client.models.invitation import Invitation
from authentik_client.models.invitation_request import InvitationRequest
from app.core.config import settings
from urllib.parse import urlparse

# from user import HomelabUser

class Authentik:
	def __init__(self):
		parsed_url = urlparse('http://10.13.11.10:9000/api/v3')
		scheme = parsed_url.scheme
		host = parsed_url.netloc
		if ':' in host:
			host, port = host.split(':')
		else:
			port = '443' if scheme == 'http' else '80'
		self.conf = ac.Configuration(
			host = f"{scheme}://{host}:{port}/api/v3",
			access_token = "wN8eSZASPvjrp5CB2bRZD7CHs9RXvvp6epiEzW2Y1EpYcyiWgBCZ8QKc1WP2"
		)
		print(self.conf)
		self.conf.api_key['authentik'] = "wN8eSZASPvjrp5CB2bRZD7CHs9RXvvp6epiEzW2Y1EpYcyiWgBCZ8QKc1WP2"
		APIClient = ac.ApiClient(self.conf)
		self.core = ac.CoreApi(APIClient)
		self.flows = ac.FlowsApi(APIClient)
		self.admin = ac.AdminApi(APIClient)
		self.stages = ac.StagesApi(APIClient)

	def fetchGroupList(self) -> list[str]:
		# grab results section of the raw ouput
		raw = self.core.core_groups_list().results

		# make a list of all the group names
		groups = [g.name for g in raw]
		# print(groups)
		return groups
	def fetchAdmins(self):
		# grab results section of the raw ouput
		raw = self.admin.admin_apps_list()
		return raw



	def fetchUserList(self) -> list[str]:
		# grab results section of the raw ouput
		raw = self.core.core_users_list().results

		# make a list of usernames from the authentik_client.User object
		users = [u.username for u in raw]
		# print(users)
		return users



	def fetchInviteFlows(self) -> list[Flow]:
		raw: list[Flow] = self.flows.flows_instances_list().results
		enrollmentFlows = []

		for flow in raw:
			if flow.designation == FlowDesignationEnum.ENROLLMENT:
				enrollmentFlows.append(flow)

		a: Flow = enrollmentFlows[0]

		return enrollmentFlows



	def shiftDate(self, ref: datetime.datetime, days: int) -> datetime.datetime:	
		return ref + datetime.timedelta(days=days)


	def fetchExistingInvites(self) -> list[str]:
		"""
		Fetches existing, unused invites.
		"""

		raw: list[Invitation] = self.stages.stages_invitation_invitations_list().results

		names = [a.name for a in raw]
		return names
		

	def inviteExists(self, user):
		existing = self.fetchExistingInvites()
		for a in existing:
			if a[:-7] == user.username:
				return True
			else:
				return False
		
		if len(existing) == 0:
			return False


	def createInvite(self, user, flow: Flow):
		today = datetime.datetime.today()
		expires = self.shiftDate(today, +14)

		data = user.createAuthInviteData()
		data['invite_expires'] = str(expires)

		invite = InvitationRequest(
			name=f'{user.username}-invite',
			expires=expires,
			fixed_data=data,
			single_use=True,
			flow=flow.pk,
		)

		return self.stages.stages_invitation_invitations_create(invite)