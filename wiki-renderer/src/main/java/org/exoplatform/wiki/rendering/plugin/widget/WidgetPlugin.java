/*
 * Copyright (C) 2003-2014 eXo Platform SAS.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
package org.exoplatform.wiki.rendering.plugin.widget;

import org.exoplatform.container.component.BaseComponentPlugin;

/**
 * Created by The eXo Platform SAS
 * Author : eXoPlatform
 *          exo@exoplatform.com
 * Jan 16, 2014  
 */
public abstract class WidgetPlugin extends BaseComponentPlugin {
  
  /**
   * encode the html
   * @param source the source html
   * @return encoded html
   * @throws Exception
   */
  public abstract String encodeHtml(String source) throws Exception;
  
  /**
   * decode the html
   * @param source
   * @return
   * @throws Exception
   */
  public abstract String decodeHtml(String source) throws Exception;
  
}
