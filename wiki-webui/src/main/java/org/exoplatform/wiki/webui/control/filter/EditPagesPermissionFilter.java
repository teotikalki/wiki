/*
 * Copyright (C) 2003-2011 eXo Platform SAS.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation; either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see<http://www.gnu.org/licenses/>.
 */
package org.exoplatform.wiki.webui.control.filter;

import org.exoplatform.container.ExoContainerContext;
import org.exoplatform.services.security.ConversationState;
import org.exoplatform.webui.ext.filter.UIExtensionAbstractFilter;
import org.exoplatform.webui.ext.filter.UIExtensionFilterType;
import org.exoplatform.wiki.commons.Utils;
import org.exoplatform.wiki.mow.api.Page;
import org.exoplatform.wiki.mow.api.PermissionType;
import org.exoplatform.wiki.service.WikiService;

import java.util.Map;

public class EditPagesPermissionFilter extends UIExtensionAbstractFilter {

  private WikiService wikiService;

  public EditPagesPermissionFilter() {
    this(null);
  }

  public EditPagesPermissionFilter(String messageKey) {
    super(messageKey, UIExtensionFilterType.MANDATORY);
    this.wikiService = ExoContainerContext.getCurrentContainer().getComponentInstanceOfType(WikiService.class);
  }
  
  @Override
  public boolean accept(Map<String, Object> context) throws Exception {
    Page page = Utils.getCurrentWikiPage();
    if (page == null) {
      return false;
    }
    return wikiService.hasPermissionOnPage(page, PermissionType.EDITPAGE, ConversationState.getCurrent().getIdentity());
  }

  @Override
  public void onDeny(Map<String, Object> context) throws Exception {
  }
}
